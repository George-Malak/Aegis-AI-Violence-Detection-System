import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Conv3D, MaxPooling3D, TimeDistributed, Flatten, Dense, Dropout, Concatenate

class ViolenceDetectorSlowFast:
    def __init__(self, input_shape=(None, 64, 64, 3), num_classes=14):
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.model = self.build_model()
        
    def build_model(self):
        input_layer = Input(shape=self.input_shape)
        
        slow_input = tf.gather(input_layer, tf.range(0, tf.shape(input_layer)[1], 4), axis=1)
        
        slow_conv = Conv3D(32, (3, 3, 3), activation='relu', padding='same')(slow_input)
        slow_pool = MaxPooling3D((1, 2, 2))(slow_conv)
        slow_flat = TimeDistributed(Flatten())(slow_pool)
        slow_dense = TimeDistributed(Dense(64, activation='relu'))(slow_flat)
        slow_out = TimeDistributed(Dense(32, activation='relu'))(slow_dense)
        slow_final = Flatten()(slow_out)
        
        fast_conv = Conv3D(8, (3, 3, 3), activation='relu', padding='same')(input_layer)
        fast_pool = MaxPooling3D((1, 2, 2))(fast_conv)
        fast_flat = TimeDistributed(Flatten())(fast_pool)
        fast_dense = TimeDistributed(Dense(32, activation='relu'))(fast_flat)
        fast_out = TimeDistributed(Dense(16, activation='relu'))(fast_dense)
        fast_final = Flatten()(fast_out)
        
        merged = Concatenate()([slow_final, fast_final])
        
        drop = Dropout(0.5)(merged)
        output = Dense(self.num_classes, activation='softmax')(drop)
        
        model = Model(inputs=input_layer, outputs=output)
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
