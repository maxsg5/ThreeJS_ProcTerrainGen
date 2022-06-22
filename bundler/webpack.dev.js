const path = require('path')
const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')
const portFinderSync = require('portfinder-sync')

const infoColor = (_message) =>
{
    return `\u001b[1m\u001b[34m${_message}\u001b[39m\u001b[22m`
}

//merges what was in webpack.common.js with this new object
module.exports = merge(
    commonConfiguration,
    {
        //controls what bundle info gets displayed,
        //in this case its errors and warnings
        stats: 'errors-warnings',
        //determines what built-in optimizations are used
        mode: 'development',
        //only logs errors and warnings
        infrastructureLogging:
        {
            level: 'warn',
        },
        devServer:
        {
            //use IPv4 address
            host: 'local-ip',
            //find an open port starting at 8080
            port: portFinderSync.getPort(8080),
            //will automatically open the browser
            open: true,
            //served over http
            https: false,
            //bipases host checking (not secure)
            allowedHosts: 'all',
            //disables hot module replacement see https://webpack.js.org/concepts/hot-module-replacement/
            hot: false,
            //watches for any changes to the files listed
            watchFiles: ['src/**', 'static/**'],
            static:
            {
                //watch all files in static directory
                watch: true,
                //where to get the static content from
                directory: path.join(__dirname, '../static')
            },
            client:
            {
                //logging disabled in browser
                logging: 'none',
                //shows a full screen message of compiler errors
                overlay: true,
                //prints compilation progress
                progress: true
            },
            //custome middleware
            setupMiddlewares: function (middlewares, devServer)
            {
                console.log('------------------------------------------------------------')
                console.log(devServer.options.host)
                const port = devServer.options.port
                const https = devServer.options.https ? 's' : ''
                const domain1 = `http${https}://${devServer.options.host}:${port}`
                const domain2 = `http${https}://localhost:${port}`

                console.log(`Project running at:\n  - ${infoColor(domain1)}\n  - ${infoColor(domain2)}`)

                return middlewares
            }
        }
    }
)
