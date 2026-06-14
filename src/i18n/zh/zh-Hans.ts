import dedent from 'dedent';

export default {
    components: {
        'multi-input': {
            invalid: '输入不合法',
        },
    },
    api: {
        'clear-cache': '清空缓存',
        'cache-cleared': {
            header: '缓存清理',
            content: '已清空缓存，后续下载将从服务器获取最新数据',
        },
    },
    novel: {
        download: '下载Epub',
    },
    series: {
        download: '下载Epub',
    },
    custom: {
        download: '合并下载多篇小说',
        input: {
            header: '合并下载多篇小说',
            content: '请输入需要下载的小说的链接或者ID\n输入完毕后，使用 回车、空格或逗号 添加到列表',
            buttons: {
                ok: '确定',
                cancel: '取消',
            },
            invalid: {
                common: '输入格式错误',
                duplicate: '已添加过此书',
            },
        },
        'novel-api-error': {
            header: '合并下载多篇小说',
            content: '获取小说数据错误：\n请检查输入是否有误，以及网络是否通畅',
        },
        'invalid-input': {
            header: '输入格式错误',
            content: '请检查输入格式是否正确\n输入小说的链接或者ID，输入完毕后，使用 回车 或者 空格 添加到列表',
        },
        'fetching-data': '正在获取小说数据',
        filename: {
            header: '合并下载多篇小说',
            content: '请输入保存Epub的文件名：',
        },
    },
    downloader: {
        epub: {
            link: '小说链接：<a href="{link}">{link}</a>',
            notes: dedent`
                <div>EPUB 生成自: <a href="{link}">{link}</a></div>
                <div>由 <a href="{scriptUrl}">{scriptName}</a> 生成，作者 <a href="{authorUrl}">{authorName}</a></div><br>
                <div>版权归文章作者所有。阅读和分发此文件时，请遵守相关法律法规。</div>
            `,
        },
        progress: {
            'novel-api': '加载小说数据',
            'series-api': '加载系列数据',
            'series-index': '加载系列目录',
            'series-novel': '加载系列小说',
            cover: '加载封面图',
            images: '加载插图',
            generate: '合成Epub文件',
            save: '保存Epub文件',
        },
        error: {
            message: '下载出现错误，请重试或向开发者反馈',
            header: '下载错误',
        },
    },
    popup: {
        dialog: {
            dialog: {
                header: '默认标题',
                buttons: {
                    ok: '确定',
                }
            },
            alert: {
                header: '提示',
                buttons: {
                    ok: '确定',
                },
            },
            prompt: {
                header: '请输入',
                buttons: {
                    ok: '确定',
                    cancel: '取消',
                }
            },
        },
    },
};
