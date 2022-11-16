const github = require('@actions/github');
const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require('fs');
const dayjs = require('dayjs');

const COMMIT_MSG = core.getInput("COMMIT_MSG");
const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');

const START_FLAG = "<!--START_SECTION:blog-->";
const END_FLAG = "<!--END_SECTION:blog-->";

async function run() {
    const octokit = github.getOctokit(GITHUB_TOKEN);
    const issuesInfo = await octokit.rest.issues.listForRepo({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        sort: 'updated-desc',
        per_page: 20
    });
    core.debug(`Got issues: ${JSON.stringify(issuesInfo)}`);
    const issues = issuesInfo.data;
    if (issues.length === 0) {
        core.info(`Get no issues, exit`);
        return
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
        console.log('No updated.')
    } else {
        fs.writeFileSync("./README.md", readmeContent.join("\n"));
        await commitFile();
    }
}

function formatIssue(idx, issue) {
    const updateTime = `${dayjs(issue.updated_at).format('YYYY-MM-DD')}`;
    const title = `[${issue.title}](${issue.html_url})`;
    const summary = issue.body ? issue.body.trim().replaceAll('\r\n', ' ').substring(0, 50) : '';
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
    await exec.exec("git", [
        "config",
        "--global",
        "user.email",
        "41898282+github-actions[bot]@users.noreply.github.com",
    ]);
    await exec.exec("git", ["config", "--global", "user.name", "readme-bot"]);
    await exec.exec("git", ["add", "README.md"]);
    await exec.exec("git", ["commit", "-m", COMMIT_MSG]);
    await exec.exec("git", ["push"]);
};

try {
    run();
} catch (error) {
    core.setFailed(error.message);
}
