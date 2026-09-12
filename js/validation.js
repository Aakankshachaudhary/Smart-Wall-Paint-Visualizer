function isValidEmail(value) {
  return / ^ [ ^ \s@] + @[ ^ \s@] + \.[ ^ \s@] + $ /.test(String(value || ""));
}
function isStrongEnoughPassword(value) {
  return String(value || "").length >= 6;
}
