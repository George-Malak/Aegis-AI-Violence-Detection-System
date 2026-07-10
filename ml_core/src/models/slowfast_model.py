import tensorflow as tf
import tensorflow_hub as hub

class ViolenceDetectorSlowFast:
    def __init__(self, num_classes=14):
        self.num_classes = num_classes
        self.model_url = "https://tfhub.dev/deepmind/slowfast-r50/kinetics400/1"
        self.model = self.build_model()
        
    def build_model(self):
        slowfast_layer = hub.KerasLayer(self.model_url, trainable=False)
        
        inputs = tf.keras.Input(shape=(None, 64, 64, 3)) 
        
        x = slowfast_layer(inputs)
        
        outputs = tf.keras.layers.Dense(self.num_classes, activation='softmax')(x)
        
        model = tf.keras.Model(inputs=inputs, outputs=outputs)
        
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        return model