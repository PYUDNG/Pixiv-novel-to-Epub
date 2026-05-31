import './hooks.ts';
import './style.css';
import './styling.ts';
import './loader.ts';
import { prompt, alert } from './utils/index.ts';

const dark = document.documentElement.getAttribute('data-theme') === 'dark';
const nickname = await prompt('设定你的昵称：', {
    header: '昵称选择',
    value: '张三',
    dark: dark,
});
nickname && alert(`欢迎你，${ nickname }！`, {
    header: '昵称选择',
    seamless: true,
    dark: dark,
});
