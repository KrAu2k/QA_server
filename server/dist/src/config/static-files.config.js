"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectStaticConfigs = getProjectStaticConfigs;
exports.getProjectStaticUrl = getProjectStaticUrl;
const path_1 = require("path");
const fs_1 = require("fs");
function getProjectStaticConfigs() {
    const configs = [];
    const project0171Path = (0, path_1.join)(__dirname, '..', '..', 'project_d', '0171', 'build');
    if ((0, fs_1.existsSync)(project0171Path)) {
        configs.push({
            rootPath: project0171Path,
            serveRoot: '/games/0171',
            serveStaticOptions: {
                index: 'index.html',
                fallthrough: false,
            },
        });
    }
    const gamesRootPath = (0, path_1.join)(__dirname, '..', '..', 'project_d');
    if ((0, fs_1.existsSync)(gamesRootPath)) {
        configs.push({
            rootPath: gamesRootPath,
            serveRoot: '/games',
            serveStaticOptions: {
                index: false,
                fallthrough: true,
            },
        });
    }
    return configs;
}
function getProjectStaticUrl(projectId, baseUrl = '') {
    return `${baseUrl}/games/${projectId}`;
}
//# sourceMappingURL=static-files.config.js.map