const path = require("path");

module.exports = {
    mode: "production",
    entry: "./main.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
    },
    target: "node",
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, "./config.json"),
                },
            ],
        }),
    ],
};
