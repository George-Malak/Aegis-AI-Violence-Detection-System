import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Conv3D, MaxPooling3D, Concatenate, BatchNormalization, Activation

class ViolenceDetectorSlowFast:
    def __init__(self, input_shape=(32, 64, 64, 3), num_classes=14):
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.model = self.build_model()
        
    def build_model(self):
        inputs = Input(shape=self.input_shape)
        
        slow_path = tf.gather(inputs, tf.range(0, self.input_shape[0], 4), axis=1)
        
        fast_path = inputs
        
        slow_conv1 = Conv3D(16, (3, 3, 3), padding='same')(slow_path)
        fast_conv1 = Conv3D(4, (3, 3, 3), padding='same')(fast_path)
        
        fast_to_slow = MaxPooling3D((4, 1, 1))(fast_conv1) 
        merged = Concatenate(axis=-1)([slow_conv1, fast_to_slow])
        
        x = Activation('relu')(merged)
        x = MaxPooling3D((1, 2, 2))(x)
        
        x = tf.keras.layers.GlobalAveragePooling3D()(x)
        output = tf.keras.layers.Dense(self.num_classes, activation='softmax')(x)
        
        model = Model(inputs=inputs, outputs=output)
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        return model