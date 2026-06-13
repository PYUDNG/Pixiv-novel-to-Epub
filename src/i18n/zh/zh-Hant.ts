import dedent from "dedent";

export default {
    api: {
        'clear-cache': '清空緩存',
        'cache-cleared': {
            header: '緩存清理',
            content: '已清空緩存，後續下載將從伺服器獲取最新資料',
        },
    },
    novel: {
        download: '下載Epub',
    },
    series: {
        download: '下載Epub',
    },
    custom: {
        download: '合併下載多篇小說',
        input: {
            header: '合併下載多篇小說',
            content: '請輸入需要下載的小說的連結或ID\n每行一個，或者在一行中使用空格或逗號分隔：',
        },
        'novel-api-error': {
            header: '合併下載多篇小說',
            content: '獲取小說資料錯誤：\n請檢查輸入是否有誤，以及網路是否通暢',
        },
        'invalid-input': {
            header: '輸入格式錯誤',
            content: '請檢查輸入格式是否正確\n每行一個小說的連結或ID，或者在一行中使用空格或逗號分隔多個連結或ID',
        },
        'fetching-data': '正在獲取小說資料',
        filename: {
            header: '合併下載多篇小說',
            content: '請輸入儲存Epub的檔案名稱：',
        },
    },
    downloader: {
        epub: {
            link: '小說連結：<a href="{link}">{link}</a>',
            notes: dedent`
                <div>從以下來源產生 EPUB：<a href="{link}">{link}</a></div>
                <div>由 <a href="{scriptUrl}">{scriptName}</a> 產生，作者：<a href="{authorUrl}">{authorName}</a></div><br>
                <div>版權歸文章作者所有。閱讀與散布本檔案時，請遵守相關法律規定。</div>
            `,
        },
        progress: {
            'novel-api': '載入小說資料',
            'series-api': '載入系列資料',
            'series-index': '載入系列目錄',
            'series-novel': '載入系列小說',
            cover: '載入封面圖',
            images: '載入插圖',
            generate: '合成Epub檔案',
            save: '儲存Epub檔案',
        },
        error: {
            message: '下載發生錯誤，請重試或向開發者回報',
            header: '下載錯誤',
        },
    },
    popup: {
        dialog: {
            dialog: {
                header: '預設標題',
                buttons: {
                    ok: '確定',
                }
            },
            alert: {
                header: '提示',
                buttons: {
                    ok: '確定',
                },
            },
            prompt: {
                header: '請輸入',
                buttons: {
                    ok: '確定',
                    cancel: '取消',
                }
            },
        },
    },
};
