import tensorflow as tf
from tensorflow.keras.models import Model
from tensorflow.keras.layers import (
    Input,
    Dense,
    Dropout,
    Flatten,
    Layer,
    GlobalAveragePooling3D,
    Conv3D,
    BatchNormalization,
    ReLU,
    Add,
    Multiply,
    Reshape,
    Activation,
)


class SqueezeExcite3D(Layer):
    """Squeeze-and-Excitation block used inside X3D residual units."""

    def __init__(self, channels, se_ratio=0.0625):
        super(SqueezeExcite3D, self).__init__()
        reduced = max(1, int(channels * se_ratio))
        self.pool = GlobalAveragePooling3D(keepdims=True)
        self.fc1 = Conv3D(reduced, kernel_size=1, activation="relu")
        self.fc2 = Conv3D(channels, kernel_size=1, activation="sigmoid")

    def call(self, inputs):
        x = self.pool(inputs)
        x = self.fc1(x)
        x = self.fc2(x)
        return Multiply()([inputs, x])


class X3DBottleneck(Layer):
    """
    X3D residual block:
    1x1x1 conv (channel expand) -> 3x3x3 depthwise-style conv (spatiotemporal) -> SE -> 1x1x1 conv (project) -> residual add
    """

    def __init__(self, out_channels, expansion=2.25, stride=1, use_se=True):
        super(X3DBottleneck, self).__init__()
        mid_channels = int(out_channels * expansion)
        self.use_se = use_se
        self.stride = stride
        self.out_channels = out_channels

        self.conv1 = Conv3D(mid_channels, kernel_size=1, padding="same", use_bias=False)
        self.bn1 = BatchNormalization()

        self.conv2 = Conv3D(
            mid_channels,
            kernel_size=3,
            strides=(1, stride, stride),
            padding="same",
            groups=mid_channels,
            use_bias=False,
        )  # depthwise-style
        self.bn2 = BatchNormalization()

        if use_se:
            self.se = SqueezeExcite3D(mid_channels)

        self.conv3 = Conv3D(out_channels, kernel_size=1, padding="same", use_bias=False)
        self.bn3 = BatchNormalization()

        self.relu = ReLU()

        self.shortcut_conv = None  # created lazily in build() if needed

    def build(self, input_shape):
        in_channels = input_shape[-1]
        if in_channels != self.out_channels or self.stride != 1:
            self.shortcut_conv = Conv3D(
                self.out_channels,
                kernel_size=1,
                strides=(1, self.stride, self.stride),
                padding="same",
                use_bias=False,
            )
            self.shortcut_bn = BatchNormalization()
        super(X3DBottleneck, self).build(input_shape)

    def call(self, inputs):
        shortcut = inputs
        if self.shortcut_conv is not None:
            shortcut = self.shortcut_conv(shortcut)
            shortcut = self.shortcut_bn(shortcut)

        x = self.conv1(inputs)
        x = self.bn1(x)
        x = self.relu(x)

        x = self.conv2(x)
        x = self.bn2(x)
        x = self.relu(x)

        if self.use_se:
            x = self.se(x)

        x = self.conv3(x)
        x = self.bn3(x)

        x = Add()([x, shortcut])
        x = self.relu(x)
        return x


class ViolenceDetectorX3D:
    def __init__(self, input_shape=(13, 160, 160, 3), num_classes=14, width_factor=1.0):
        """
        input_shape: (frames, height, width, channels)
        num_classes: number of output action/violence classes
        width_factor: channel width multiplier (X3D scaling knob, similar to x3d_s / x3d_m / x3d_l)
        """
        self.input_shape = input_shape
        self.num_classes = num_classes
        self.width_factor = width_factor
        self.model = self.build_model()

    def _c(self, base_channels):
        return int(base_channels * self.width_factor)

    def build_model(self):
        input_layer = Input(shape=self.input_shape)

        # Stem: spatial 3x3 conv + temporal 1-frame conv (X3D stem is factorized)
        x = Conv3D(
            self._c(24),
            kernel_size=(1, 3, 3),
            strides=(1, 2, 2),
            padding="same",
            use_bias=False,
        )(input_layer)
        x = BatchNormalization()(x)
        x = ReLU()(x)
        x = Conv3D(
            self._c(24),
            kernel_size=(5, 1, 1),
            strides=(1, 1, 1),
            padding="same",
            use_bias=False,
        )(x)
        x = BatchNormalization()(x)
        x = ReLU()(x)

        # Stage 1
        x = X3DBottleneck(self._c(24), stride=2)(x)
        x = X3DBottleneck(self._c(24), stride=1)(x)

        # Stage 2
        x = X3DBottleneck(self._c(48), stride=2)(x)
        x = X3DBottleneck(self._c(48), stride=1)(x)

        # Stage 3
        x = X3DBottleneck(self._c(96), stride=2)(x)
        x = X3DBottleneck(self._c(96), stride=1)(x)

        # Stage 4
        x = X3DBottleneck(self._c(192), stride=2)(x)
        x = X3DBottleneck(self._c(192), stride=1)(x)

        # Head: 1x1x1 conv to expand channels before pooling (as in X3D head)
        x = Conv3D(self._c(432), kernel_size=1, padding="same", use_bias=False)(x)
        x = BatchNormalization()(x)
        x = ReLU()(x)

        x = GlobalAveragePooling3D()(x)
        x = Dense(2048, activation="relu")(x)
        x = Dropout(0.5)(x)

        output = Dense(self.num_classes, activation="softmax")(x)

        model = Model(inputs=input_layer, outputs=output)
        model.compile(
            optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"]
        )
        return model

    def summary(self):
        return self.model.summary()
