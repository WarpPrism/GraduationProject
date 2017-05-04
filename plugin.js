// 初始化项目插件，如变量控制插件，帧率显示插件等等

function initStats() {
    var stats = new Stats();
    stats.setMode(0);
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    $('#stats-output').append(stats.domElement);
    return stats;
}
