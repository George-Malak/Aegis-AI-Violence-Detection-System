import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import TimeDistributed, Conv2D, MaxPooling2D, Flatten, LSTM, GRU, Dense, Dropout, BatchNormalization

class ViolenceDetectorCNNTemporal:
    def __init__(self, input_shape=(None, 64, 64, 3), rnn_type='LSTM', num_classes=14):
        self.input_shape = input_shape
        self.rnn_type = rnn_type.upper()
        self.num_classes = num_classes
        self.model = self.build_model()
        
    def build_model(self):
        model = Sequential()
        #Conv with 32 filter each filter 3x3
        model.add(TimeDistributed(
            Conv2D(32, (3, 3), activation='relu', padding='same'), 
            input_shape=self.input_shape
        ))
        model.add(TimeDistributed(MaxPooling2D((2, 2))))
        model.add(TimeDistributed(BatchNormalization()))
        #another layer
        model.add(TimeDistributed(Conv2D(64, (3, 3), activation='relu', padding='same')))
        model.add(TimeDistributed(MaxPooling2D((2, 2))))
        model.add(TimeDistributed(BatchNormalization()))
        
        model.add(TimeDistributed(Flatten()))
        
        if self.rnn_type == 'GRU':
            model.add(GRU(64, return_sequences=False))
        elif self.rnn_type == 'LSTM':
            model.add(LSTM(64, return_sequences=False))
        else:
            print(f"Warning: Unknown rnn_type '{self.rnn_type}'. Defaulting to 'LSTM'.")
            model.add(LSTM(64, return_sequences=False))
            
        model.add(Dropout(0.5))
        
        model.add(Dense(self.num_classes, activation='softmax'))
        
        model.compile(
            optimizer='adam', 
            loss='categorical_crossentropy', 
            metrics=['accuracy']
        )
        
        return model
