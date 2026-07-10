
function classify({ label, confidencePct }) {
  if (label !== 'violence') {
    return { event: 'Normal Activity', status: 'success', notify: false };
  }

  if (confidencePct >= 85) {
    return { event: 'Weapon / Violence Detection', status: 'danger', notify: true };
  }
  if (confidencePct >= 60) {
    return { event: 'Suspicious Activity', status: 'warning', notify: true };
  }
  return { event: 'Possible Anomaly', status: 'info', notify: false };
}

module.exports = { classify };
