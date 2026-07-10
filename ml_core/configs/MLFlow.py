"""MLflow logging utility for experiment tracking.

This file contains the configuration setup to initialize experiments, 
log hyperparameters, record metrics per epoch, and save model artifacts.
"""

import os
from typing import Any, Dict
import torch
import mlflow
import mlflow.pytorch


class MLflowLogger:
    """Handles initialization, parameter tracking, metric logging, and artifact saving using MLflow."""

    def __init__(self, experiment_name: str, tracking_uri: str = "./mlruns"):
        """Set up tracking URI location and establish or load the specified experiment container."""
        mlflow.set_tracking_uri(tracking_uri)
        mlflow.set_experiment(experiment_name)
        self.active_run = None

    def start_run(self, run_name: str) -> None:
        """Start a new active tracking run session."""
        self.active_run = mlflow.start_run(run_name=run_name)
        print(f"MLflow Run Started: '{run_name}' under Experiment tracking.")

    def log_parameters(self, params: Dict[str, Any]) -> None:
        """Record pipeline hyperparameters like learning rates, batch sizes, or architectural choices."""
        if mlflow.active_run():
            mlflow.log_params(params)

    def log_epoch_metrics(self, metrics: Dict[str, float], epoch: int) -> None:
        """Log training and validation metrics linked explicitly against the current epoch index."""
        if mlflow.active_run():
            mlflow.log_metrics(metrics, step=epoch)

    def log_model_checkpoint(self, model: torch.nn.Module, artifact_path: str = "model_checkpoints") -> None:
        """Save the PyTorch model state dict directly into the MLflow artifact storage container."""
        if mlflow.active_run():
            mlflow.pytorch.log_model(model, artifact_path=artifact_path)
            print(f"Model state dictionary saved successfully to MLflow artifact path: {artifact_path}")

    def end_run(self) -> None:
        """Safely terminate the current active run session."""
        if mlflow.active_run():
            mlflow.end_run()
            print("MLflow Run Session closed.")


"""
# 1. Initialize Logger
logger = MLflowLogger(experiment_name="Aegis-AI_VideoMAE")

# 2. Define Hyperparameters to track
hyperparams = {
    "model_backbone": "MCG-NJU/videomae-base",
    "learning_rate": 5e-5,
    "batch_size": 8,
    "epochs": 10,
    "optimizer": "AdamW"
}

# 3. Start Training Session
logger.start_run(run_name="VideoMAE_Base_Run_1")
logger.log_parameters(hyperparams)

# --- Simulated Training Loop ---
for epoch in range(hyperparams["epochs"]):
    # Mocking loss and accuracy computations for demonstration
    train_loss = 0.5 / (epoch + 1)
    val_acc = 0.70 + (epoch * 0.02)
    
    # Log metrics at the end of each epoch
    logger.log_epoch_metrics(
        metrics={"train_loss": train_loss, "val_accuracy": val_acc}, 
        epoch=epoch
    )
    print(f"Epoch {epoch}: Loss={train_loss:.4f}, Accuracy={val_acc:.4f}")

# 4. Save Final Trained Model Instance inside MLflow
# logger.log_model_checkpoint(model=your_video_mae_model_instance)

# 5. Always Close the Run
logger.end_run()
"""