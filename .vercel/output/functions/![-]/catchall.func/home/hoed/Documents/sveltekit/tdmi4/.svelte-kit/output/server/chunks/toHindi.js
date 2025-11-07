const hindiDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toHindi(str) {
  if (str === null || str === void 0) {
    return "-";
  }
  let result = String(str);
  result = result.replace(/[0-9]/g, (match) => {
    return hindiDigits[parseInt(match, 10)];
  });
  return result;
}
export {
  toHindi as t
};
