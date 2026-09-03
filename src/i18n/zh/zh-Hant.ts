import dedent from "dedent";

export default {
    components: {
        'multi-input': {
            invalid: '輸入不合法',
        },
    },
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
    author: {
        download: '下載作者所有小說Epub',
        confirm: '下載作者的全部小說和系列小說？',
    },
    custom: {
        download: '自訂下載',
        input: {
            dialog: {
                header: '自訂下載',
                buttons: {
                    ok: '確定',
                    cancel: '取消',
                },
                disable: {
                    'no-novels': '請先新增一些小說再下載',
                    'filter-mode': '請先退出篩選模式再下載',
                }
            },
            input: {
                label: '新增小說',
                guide: '按照提示輸入，回車/空格/逗號/右側+按鈕 新增到列表',
                id: {
                    placeholder: '輸入ID，支援 小說/系列/作者/收藏',
                    options: {
                        novel: '小說',
                        series: '系列小說',
                        author: '作者的全部小說',
                        'favorite:public': '使用者的公開收藏',
                        'favorite:private': '使用者的非公開收藏',
                    },
                    'invalid-id': 'ID格式錯誤',
                    duplicate: '已新增過此書',
                    'partial-duplicate': '您輸入的部分小說已新增過，僅會新增未新增過的小說',
                },
                link: {
                    placeholder: '輸入連結，支援 小說/系列/作者/收藏',
                    'invalid-link': '連結格式錯誤',
                    duplicate: '已新增過此書',
                    'partial-duplicate': '您輸入的部分小說已新增過，僅會新增未新增過的小說',
                },
            },
            options: {
                label: '下載選項',
                merge: '合併下載為一個Epub檔案',
                filename: '檔案名稱',
            },
            list: {
                label: '小說列表 ({total})',
                'label-filter': '篩選模式 ({preserved}/{total})',
                filter: {
                    'include-title': '書名包含',
                    'exclude-title': '書名不含',
                    'include-tag': '含有標籤',
                    'exclude-tag': '不含標籤',
                    favorite: {
                        label: '收藏狀態',
                        include: '已收藏',
                        exclude: '未收藏',
                    },
                },
                preview: {
                    error: '小說資料載入失敗',
                    loading: '載入中...',
                },
                empty: '書單是空的，先在左側新增一些小說吧',
                'no-filter': '請先新增一些篩選條件',
                'filter-not-loaded': '有 {count} 本小說尚未載入完成，請等待載入完畢後再提交篩選結果',
            },
            'calc-filename': '生成',
        },
        'novel-api-error': {
            header: '合併下載多篇小說',
            content: '獲取小說資料錯誤：\n請檢查輸入是否有誤，以及網路是否通暢',
        },
        'invalid-input': {
            header: '輸入格式錯誤',
            content: '請檢查輸入格式是否正確\n輸入小說的連結或ID，輸入完畢後，使用 回車 或者 空格 加入到列表',
        },
        'fetching-data': '正在獲取小說資料',
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
            novel: '載入單篇小說',
            series: '載入系列小說',
            'profile-index': '載入作品列表',
            'profile-data': '載入作品資料',
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
            app: {
                buttons: {
                    'click-through': '視窗穿透',
                    close: '關閉',
                }
            },
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
            confirm: {
                header: '確認',
                buttons: {
                    ok: '確定',
                    cancel: '取消',
                },
            },
            prompt: {
                header: '請輸入',
                buttons: {
                    ok: '確定',
                    cancel: '取消',
                }
            },
            select: {
                header: '請選擇',
                buttons: {
                    ok: '確定',
                    cancel: '取消',
                }
            },
        },
    },
};
