/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 93:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 590:
/***/ ((module) => {

module.exports = eval("require")("@actions/exec");


/***/ }),

/***/ 265:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ }),

/***/ 464:
/***/ ((module) => {

module.exports = eval("require")("dayjs");


/***/ }),

/***/ 147:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const github = __nccwpck_require__(265);
const core = __nccwpck_require__(93);
const exec = __nccwpck_require__(590);
const fs = __nccwpck_require__(147);
const dayjs = __nccwpck_require__(464);

const COMMIT_MSG = core.getInput("COMMIT_MSG");
const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
const NUMBER = core.getInput('NUMBER');
const SUMMARY_LENGTH = core.getInput('SUMMARY_LENGTH');
const OWNER = core.getInput('OWNER');
const REPO = core.getInput('REPO');
const GITHUB_NAME = core.getInput('GITHUB_NAME');
const GITHUB_EMAIL = core.getInput('GITHUB_EMAIL');

const START_FLAG = "<!--START_SECTION:blog-->";
const END_FLAG = "<!--END_SECTION:blog-->";

async function run () {
    const octokit = github.getOctokit(GITHUB_TOKEN);
    const issuesInfo = await octokit.rest.issues.listForRepo({
        owner: OWNER ? OWNER : github.context.repo.owner,
        repo: REPO ? REPO : github.context.repo.repo,
        sort: 'updated-desc',
        per_page: NUMBER,
    });
    core.debug(`Got issues: ${JSON.stringify(issuesInfo)}`);
    const issues = issuesInfo.data;
    if (issues.length === 0) {
        console.log(`Get no issues, exit`);
        return;
    }

    const readmeContent = fs.readFileSync("./README.md", "utf-8").split("\n");
    let {startIdx, endIdx} = findIndex(readmeContent);
    const oldReadmeContent = [...readmeContent];
    // Clear old activities between START_FLAG and END_FLAG
    readmeContent.splice(startIdx + 1, endIdx - startIdx - 1);

    startIdx++;
    const preArr = preFormatIssue(issues);
    readmeContent.splice(startIdx, 0, preArr.join('\n'));
    issues.forEach((issue, idx) => readmeContent.splice(startIdx + idx + preArr.length - 1, 0, formatIssue(idx, issue)));
    if (oldReadmeContent.join("\n") === readmeContent.join("\n")) {
        console.log('No updated.');
        return;
    }

    fs.writeFileSync("./README.md", readmeContent.join("\n"));
    await commitFile();
}

function formatIssue(idx, issue) {
    const updateTime = `${dayjs(issue.updated_at).format('YYYY-MM-DD')}`;
    const title = `[${issue.title}](${issue.html_url})`;
    const summary = issue.body ? issue.body.trim().replaceAll('\r\n', ' ').substring(0, parseInt(SUMMARY_LENGTH)) : '';
    return `| ${updateTime} | ${title} | ${summary} |`;
}

function preFormatIssue(issues) {
    return ['| UpdateTime | Title | Summary |', '| ------ | ------ | ------ |'];
}

function findIndex(readmeContent) {
    let startIdx = readmeContent.findIndex(content => content.trim() === START_FLAG);
    const endIdx = readmeContent.findIndex(content => content.trim() === END_FLAG);
    if (startIdx === -1 || endIdx === -1) {
        throw new Error(`Couldn't find both ${START_FLAG} and ${END_FLAG} comment. Exiting!`);
    }
    return {startIdx, endIdx};
}

const commitFile = async () => {
    if (GITHUB_NAME && GITHUB_EMAIL) {
        await exec.exec("git", ["config", "--global", "user.email", GITHUB_EMAIL]);
        await exec.exec("git", ["config", "--global", "user.name", GITHUB_NAME]);
    } else {
        await exec.exec("git", ["config", "--global", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"]);
        await exec.exec("git", ["config", "--global", "user.name", "readme-bot"]);
    }
    await exec.exec("git", ["add", "README.md"]);
    await exec.exec("git", ["commit", "-m", COMMIT_MSG]);
    await exec.exec("git", ["push"]);
};

try {
    run();
} catch (error) {
    core.setFailed(error.message);
}

})();

module.exports = __webpack_exports__;
/******/ })()
;