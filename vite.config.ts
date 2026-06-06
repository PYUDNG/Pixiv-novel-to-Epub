import { defineConfig } from 'vite';
import pkg from './package.json';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';
import tailwindcss from '@tailwindcss/vite'
import postcssUrl from 'postcss-url';
import cssnano from 'cssnano';
import rem2px from 'postcss-rem-to-responsive-pixel';
import Icons from 'unplugin-icons/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        Icons({
            compiler: 'vue3',
        }),
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: {
                    '': 'Pixiv novel to Epub',
                    'zh-CN': 'Pixiv小说Epub合成器'
                },
                description: {
                    '': 'Download pixiv novels as Epub files',
                    'zh-CN': '下载Pixiv小说为Epub电子书文件',
                },
                icon: 'https://vitejs.dev/logo.svg',
                namespace: 'https://greasyfork.org/users/667968-pyudng',
                match: [
                    'https://www.pixiv.net/*',
                    'https://pixiv.net/*',
                ],
                require: [
                    'data:application/javascript,window.setImmediate=window.setImmediate||((f,...args)=>window.setTimeout(()=>f(...args),0))',
                ],
                version: pkg.version,
                author: pkg.author.name,
                "run-at": 'document-start',
            },
            build: {
                externalGlobals: {
                    vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
                },
                cssSideEffects: /* js */ `css => {
                    Array.isArray(window._importedStyles) ?
                        window._importedStyles.push(css) :
                        (window._importedStyles = [css]);
                }`,
            },
        }),
    ],
    css: {
        postcss: {
            plugins: [
                rem2px({
                    rootValue: 14,
                    propList: ['*'],
                    transformUnit: 'px',
                    mediaQuery: true,
                }),
                cssnano(),
                postcssUrl({
                    url: 'inline',
                    ignoreFragmentWarning: true,
                }),
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    define: {
        __GREASYFORK_URL__: JSON.stringify('https://greasyfork.org/scripts/483999'),
        __GREASYFORK_AUTHOR_URL__: JSON.stringify('https://greasyfork.org/users/667968'),
    },
    optimizeDeps: {
        exclude: ['jepub'],
        include: ['jszip']
    },
});
