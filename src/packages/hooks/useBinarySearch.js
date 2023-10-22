// 输入被查找数组和查找数组，获取最小距离,正负标识和对应的元素
export function useBinarySearch(arr, target) {
    // 长度为0不搜索
    if (arr.length == 0) return
    // 记录最小距离和元素（minDistance,value）
    let minDistance = Infinity
    let flag = 0;//0表示+，1表示-
    let value = 0
    for (let i = 0; i < target.length; i++) {
        let index = binarySearchNearest(arr, target[i]);
        let distance = Math.abs(arr[index] - target[i])
        if (minDistance > distance) {
            if (arr[index] - target[i] < 0) {
                flag = 1
            }
            minDistance = distance
            value = arr[index]
        }
    }
    return [minDistance, flag, value]

}

function binarySearchNearest(arr, target) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    // 如果左指针超出数组范围，则最近的元素在右侧
    if (left >= arr.length) {
        return arr.length - 1;
    }
    // 如果右指针超出数组范围，则最近的元素在左侧
    if (right < 0) {
        return 0;
    }

    // 根据左右指针的位置判断离目标元素最近的索引
    if (Math.abs(arr[left] - target) < Math.abs(arr[right] - target)) {
        return left;
    } else {
        return right;
    }
}


