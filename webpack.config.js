const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, args) => {
    const devMode = args.mode !== "production";

    const optimization = () => {
        const config = {
            splitChunks: {
                chunks: "all",
            },
        };

        if (!devMode) {
            config.minimizer = [
                new TerserPlugin(),
                new OptimizeCssAssetsPlugin(),
            ];
        }

        return config;
    };

    const filename = (ext) =>
        devMode ? `[name].${ext}` : `[name].[contenthash].${ext}`;

    const babelOptions = (preset) => {
        if (preset) {
            return {
                presets: ["@babel/preset-env", preset],
            };
        }
        return {
            presets: ["@babel/preset-env"],
        };
    };

    return {
        context: path.resolve(__dirname, "src"),
        mode: "development",
        devtool: "inline-source-map",
        entry: {
            main: "./index.js",
        },
        resolve: {
            // alias: {
            //     images: path.resolve(__dirname, "src/assets/images"),
            // },
            extensions: [".tsx", ".ts", ".js"],
        },
        output: {
            filename: filename("js"),
            path: path.resolve(__dirname, "dist"),
            // publicPath: "/finely/",
            clean: true,
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: filename("css"),
                chunkFilename: filename("css"),
            }),
            new HtmlWebpackPlugin({ template: "./index.html" }),
            new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, "src/icon.png"),
                        to: path.resolve(__dirname, "dist"),
                    },
                ],
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.(sa|sc|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        "sass-loader",
                    ],
                },
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: "asset/resource",
                    generator: {
                        filename: `assets/images/[name][ext]`,
                    },
                },
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: "asset/resource",
                    generator: {
                        filename: `assets/fonts/[name].[contenthash][ext]`,
                    },
                },
                {
                    test: /\.m?js$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: "babel-loader",
                        options: babelOptions("@babel/preset-typescript"),
                    },
                },
                {
                    test: /\.ts$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: "babel-loader",
                        options: babelOptions("@babel/preset-typescript"),
                    },
                },
            ],
        },
        devServer: {
            static: {
                directory: path.join(__dirname, "src"),
            },
            compress: true,
            port: 9000,
            open: true,
        },
        optimization: optimization(),
    };
};
