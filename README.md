# vite-plugin-vue-auto-routes

 一个约定式路由插件，可以快速帮你生成对应的路由配置文件（约定大于配置）

> 熟悉Nuxt，Next，Umi的开发者肯定对约定式路由都很熟悉，当你工程是使用vite搭建时，安装上该插件你也可以拥有前面这几个框架的约定式路由开发体验。

## 安装

```
npm i vite-plugin-vue-auto-routes

yarn add vite-plugin-vue-auto-routes

pnpm i vite-plugin-vue-auto-routes
```

## 基本使用

```js
// vite.config.js
import { defineConfig } from 'vite'
import vitePluginVueAutoRoutes from 'vite-plugin-vue-auto-routes'

export default defineConfig({
  plugins: [
    vitePluginVueAutoRoutes({
        // options
    })
  ],
})
```

## Options

| **参数名** | **类型** | **默认值** |        **说明**        |
| :--------: | :------: | :--------: | :--------------------: |
|  pageDir   |  string  | src/views  |     页面所在的目录     |
| outputDir  |  string  | src/router | 生成路由配置文件的目录 |
|    name    |  string  |   routes   | 生成路由配置文件的名字 |
| outputType |  string  |    .js     | 生成路由配置文件的类型 |
|    lazy    | boolean  |   false    |       路由懒加载       |
|   watch    | boolean  |    true    |  监听pageDir目录变化   |

## 目录结构

```js
/vue-project
  ├── src
  │   ├── router
  │   │   └── index.js
  │   ├── views
  │	  │	  │── Index
  │   │   │   ├── Index.meta.json  // 添加路由元信息
  │   │   │   └── Index.vue
  │   │   ├── About
  │   │   │   ├── Index
  │   │   │   │   ├── Index.meta.json 
  │   │   │   │   └── Index.vue
  │   │   │   ├── [id]   // 动态路由
  │   │   │   │   ├── Index.meta.json 
  │   │   │   │   └── Index.vue
  │   │   ├── Home
  │   │   │   ├── Index
  │   │   │   │   ├── Index.meta.json 
  │   │   │   │   └── Index.vue
  │   │   │   ├── _[id]   // 嵌套动态路由
  │   │   │   │   ├── Index.meta.json 
  │   │   │   │   └── Index.vue
  │   │   └── User
  │   │       ├── Index
  │   │       │   ├── Index.meta.json
  │   │       │   └── Index.vue
  │   │       ├── _Profile  // 嵌套路由
  │   │       │   ├── Profile.meta.json
  │   │       │   └── Profile.vue
  │   └── main.js
  └── vite.config.js
```

## 添加路由元信息

```json
// src/views/Index/Index.meta.json
{
    "a":1,
    "meta":{
        "auth":true
    }
}
```

## 生成的配置文件

```js
// src/router/routes.js
export const routes =  [
  {
    path: '/',
    component: ...,
    a:1,
    meta:{
      auth:true
  	}
  },
  {
    path: '/about',
    component: ...
  },
  {
    path: '/about/:id',
    component: ...
  },
  {
    path: '/home',
    component: ...,
    children:[
      {
        path: ':id',
        component: ...
      },
    ]    
  },
  {
    path: '/user',
    component: ...,
    children:[
      {
        path: 'profile',
        component: ...
      },
    ]  
  }
]
```

