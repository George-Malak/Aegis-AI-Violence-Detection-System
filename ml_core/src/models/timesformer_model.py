import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense, Dropout, Flatten, Layer, MultiHeadAttention, LayerNormalization, Reshape

class TimeSformerAttention(Layer):
    def __init__(self, num_heads=4, key_dim=64):
        super(TimeSformerAttention, self).__init__()
        self.spatial_attention = MultiHeadAttention(num_heads=num_heads, key_dim=key_dim)
        self.temporal_attention = MultiHeadAttention(num_heads=num_heads, key_dim=key_dim)
        self.layernorm1 = LayerNormalization()
        self.layernorm2 = LayerNormalization()

    def call(self, inputs):
        shape = tf.shape(inputs)
        batch, frames, height, width, channels = shape[0], shape[1], shape[2], shape[3], shape[4]
        
        x_space = Reshape((frames * height * width, channels))(inputs)
        space_attn = self.spatial_attention(x_space, x_space)
        x = x_space + space_attn
        x = self.layernorm1(x)
        
        x_time = Reshape((frames, height * width * channels))(inputs)
        time_attn = self.temporal_attention(x_time, x_time)
        x_time = x_time + time_attn
        x_time = self.layernorm2(x_time)
        
        return Reshape((frames, height, width, channels))(x_time)

class ViolenceDetectorTimeSformer:
    def __init__(self, input_shape=(None, 64, 64, 3), num_classes=14):
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.model = self.build_model()
        
    def build_model(self):
        input_layer = Input(shape=self.input_shape)
        
        x = TimeSformerAttention()(input_layer)
        
        x = Flatten()(x)
        x = Dense(128, activation='relu')(x)
        x = Dropout(0.5)(x)
        
        output = Dense(self.num_classes, activation='softmax')(x)
        
        model = Model(inputs=input_layer, outputs=output)
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return model
