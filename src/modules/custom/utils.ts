import { Nullable } from "@/utils";

/**
 * 从一系列字符串名称中查找并返回它们的最长共同部分  
 * @param names 名称数组
 * @param minLen 最短长度要求，长度小于此数值的共同部分将被忽略；省略此参数时默认为0，即接受任意长度共同部分
 * @returns 最长共同部分（如果有）；null（如果没有找到）
 */
export function inferCommonName(names: string[], minLen: number = 0): Nullable<string> {
    // 1. 边界条件：数组为空或长度为0，直接返回 null
    if (!names || names.length === 0) return null;

    // 2. 找出长度最短的字符串作为基准，减少后续穷举的次数
    let shortest = names[0];
    for (const name of names) {
        if (name.length < shortest.length) {
            shortest = name;
        }
    }

    const maxPossibleLen = shortest.length;

    // 3. 从最长可能长度开始向下穷举（外层循环控制子串长度）
    // 长度必须大于等于 minLen 且大于 0
    for (let len = maxPossibleLen; len >= Math.max(minLen, 1); len--) {
        // 内层循环控制子串的起始位置
        for (let start = 0; start <= maxPossibleLen - len; start++) {
            const subStr = shortest.substring(start, start + len);

            // 4. 验证这个子串是否在所有字符串中都存在
            const isCommon = names.every(name => name.includes(subStr));

            // 5. 因为是从最长开始找的，第一个找到的就是“最长公共子串”
            if (isCommon) return subStr;
        }
    }

    // 6. 如果循环结束仍未找到，或者找到的长度小于 minLen，返回 null
    return null;
}