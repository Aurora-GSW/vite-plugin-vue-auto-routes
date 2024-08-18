import fs from 'node:fs'
import path from 'node:path'

const dep = []
let options = {}
let config = {}
function generateRoutesItem(pageFullPath, outputFullPath, lazy, basePath, filename) {
    const fullPath = path.resolve(basePath, filename)
    const statsObj = fs.statSync(fullPath)

    if (!statsObj.isDirectory()) return

    const relativePath = path.relative(basePath, fullPath)
    // 动态路由
    let routePath = relativePath.toLowerCase().replace(/\\/g, '/').replace(/(\/)*index/g, '').replace(/\[(\w+)\]/, (_, p) => ':' + p)
    const filenames = fs.readdirSync(fullPath)
    const componentName = 'Index.vue'
    const componentPath = path.resolve(fullPath, componentName)
    let metaFilePath = componentPath.replace(/\.vue/, '.meta.json')
    let finalPath = routePath[0] === '/' ? routePath : '/' + routePath
    let finalComponentPath = ''
    if (fs.existsSync(componentPath)) {
        finalComponentPath = path.relative(outputFullPath, componentPath).replace(/\\/g, '/')
    } else if (fs.existsSync(path.resolve(fullPath, 'Index/Index.vue'))) {
        finalComponentPath = path.relative(outputFullPath, path.resolve(fullPath, 'Index/Index.vue')).replace(/\\/g, '/')
        metaFilePath = path.resolve(fullPath, 'Index/Index.meta.json')
    }

    let metaContent = {}
    if (fs.existsSync(metaFilePath)) {
        let str = fs.readFileSync(metaFilePath, { encoding: 'utf8', flag: 'r' })
        metaContent = JSON.parse(str)
    }
    let Component = ''
    if (finalComponentPath && !lazy) {
        Component = filename.replace(/\[|\]/g, '') + '_' + Math.random().toString(36).slice(2)
        dep.push(`import ${Component} from "${finalComponentPath}"`)
    }
    let res = {
        path: finalPath,
        component: lazy ? `() => import("${finalComponentPath}")` : Component,
        ...metaContent,
    }

    let list = []
    if (finalComponentPath) list.push(res)

    let children = []
    for (const name of filenames) {
        const statsObj = fs.statSync(path.resolve(fullPath, name))
        if (name.toLowerCase() === 'index' || !statsObj.isDirectory()) continue
        const routeItemList = generateRoutesItem(pageFullPath, outputFullPath, lazy, fullPath, name)
        if (name.startsWith('_')) {
            // 嵌套路由
            if (routeItemList.length) {
                children.push(...routeItemList.map(item => ({
                    ...item,
                    path: item.path.slice(2)
                })))
            }
        } else {
            list.push(...routeItemList.map(item => ({
                ...item,
                path: finalPath === '/' ? item.path : finalPath + item.path
            })))
        }
    }

    if (children.length) res.children = children
    return list
}

function generateRoutes(pageFullPath, outputFullPath, lazy) {
    const filenames = fs.readdirSync(pageFullPath)
    const list = filenames.flatMap(filename => {
        return generateRoutesItem(pageFullPath, outputFullPath, lazy, pageFullPath, filename)
    })
    return list.filter(item => typeof item === 'object' && item !== null)
}

function startGenerater() {
    const { pageDir, outputDir, name, outputType, lazy } = options
    const pageFullPath = path.resolve(config.root, pageDir)
    const outputFullPath = path.resolve(config.root, outputDir)
    if (!fs.existsSync(pageFullPath)) return

    const routes = generateRoutes(pageFullPath, outputFullPath, lazy)

    let str = JSON.stringify(routes, null, 2)

    if (!lazy) {
        str = str.replace(/"component":\s*"(\w+)"/g, (_, p) => {
            return `"component": ${p}`;
        })
    } else {
        str = str.replace(/"component":\s*"(.*?\(\\".*?\\".*?\))"/g, function (_, p1) {
            return `"component": ${p1.replace(/\\"/g, '"')}`;
        });
    }

    let content = `export const routes = ${str}`
    if (!lazy) {
        let depStr = dep.map(d => {
            return d + '\n'
        }).join('')
        content = depStr + '\n' + content
    }

    fs.writeFileSync(path.resolve(outputFullPath, name + outputType), content)
    dep.length = 0
}

export function vitePluginVueAutoRoutes(ops = {}) {
    const { pageDir = 'src/views', outputDir = 'src/router', name = 'routes', outputType = '.js', lazy = false, watch = true } = ops
    return {
        name: 'vite-plugin-vue-auto-routes',
        configResolved(conf) {
            config = conf
            options = {
                pageDir, outputDir, name, outputType, lazy, watch
            }
            startGenerater()
            const viewsDir = path.resolve(process.cwd(), pageDir);
            if (watch) {
                fs.watch(viewsDir, { recursive: true }, (eventType, filename) => {
                    startGenerater()
                })
            }
        }
    }
}