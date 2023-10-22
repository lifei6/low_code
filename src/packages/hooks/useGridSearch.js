// 网格搜索
class GridSearch {
    constructor(width, height, gridSize) {
        this.gridSize = gridSize;
        this.grid = this.createGrid(width, height, gridSize);
    }

    createGrid(width, height, gridSize) {
        const rows = Math.ceil(height / gridSize);
        const cols = Math.ceil(width / gridSize);

        const grid = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => [])
        );
        return grid;
    }

    addToGrid(point) {
        const row = Math.floor(point[1] / this.gridSize);
        const col = Math.floor(point[0] / this.gridSize);

        // 确保网格单元格已初始化为一个数组
        if (!this.grid[row][col]) {
            this.grid[row][col] = [];
        }

        this.grid[row][col].push(point);
    }

    searchRect(rectangle) {
        const { x1, y1, x2, y2 } = rectangle;
        const results = [];

        const startRow = Math.floor(y1 / this.gridSize);
        const endRow = Math.floor(y2 / this.gridSize);
        const startCol = Math.floor(x1 / this.gridSize);
        const endCol = Math.floor(x2 / this.gridSize);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (this.grid[row][col]) {
                    for (const point of this.grid[row][col]) {
                        const [x, y] = point;
                        if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
                            results.push(point);
                        }
                    }
                }
            }
        }

        return results;
    }
}
// 参数：节点、面积宽、高、一个网格的大小
export function useGridSearch(points, width, height, gridSize) {


    // 矩形区域表示为{x1, y1, x2, y2}
    // const rectangle = { x1: 3, y1: 2, x2: 9, y2: 7 };
    // const points = [
    //     [7, 2],
    //     [2, 3],
    //     [5, 4],
    //     [9, 6],
    //     [4, 7],
    //     [8, 1],
    // ];

    // const gridSize = 2;
    // const width = 10;
    // const height = 10;
    // 1.实例化算法
    const gridSearch = new GridSearch(width, height, gridSize);
    // 2.添加节点
    for (const point of points) {
        gridSearch.addToGrid(point);
    }
    // 3.将实例暴露出去
    return gridSearch
    // const result = gridSearch.searchRect(rectangle);

    // console.log("Points inside the rectangle:", result);

}