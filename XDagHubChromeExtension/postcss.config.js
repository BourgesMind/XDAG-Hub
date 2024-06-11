
// module.exports = {
//   plugins: ["postcss-preset-env", "tailwindcss"],
// };


const postcssPresetEnv = require('postcss-preset-env');
const tailwind = require('tailwindcss');

module.exports = {
	plugins: [postcssPresetEnv(), tailwind],
};
