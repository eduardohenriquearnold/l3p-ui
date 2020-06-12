var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  configureWebpack :{
    plugins: [new HtmlWebpackPlugin({
        template: './src/index.html'
    })],
    externals: {
        // global app config object
        config: JSON.stringify({
            apiUrl: process.env.VUE_APP_API_URL //Get apiURL from ENV variable
        })
    } 
  }
}
