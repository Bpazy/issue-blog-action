const github = require('@actions/github');
const core = require('@actions/core');
const fs = require('fs');


async function run() {
    const readmeContent = fs.readFileSync("./README.md", "utf-8").split("\n");

    // Find the index corresponding to <!--START_SECTION:activity--> comment
    let startIdx = readmeContent.findIndex(content => content.trim() === "<!--START_SECTION:activity-->");

    // Early return in case the <!--START_SECTION:activity--> comment was not found
    if (startIdx === -1) {
        core.setFailed(`Couldn't find the <!--START_SECTION:activity--> comment. Exiting!`);
    }

    // Find the index corresponding to <!--END_SECTION:activity--> comment
    const endIdx = readmeContent.findIndex(content => content.trim() === "<!--END_SECTION:activity-->");
    console.log(`startIdx: ${startIdx}, endIdx: ${endIdx}`);

    const octokit = github.getOctokit(core.getInput('githubToken'))
    console.log(`We can even get context data, like the repo: ${github.context.repo}`)
    const issues = octokit.rest.issues.listForRepo({owner: github.context.repo.owner, repo: github.context.repo.repo});
    console.log(`Got issues: ${issues}`);
}

try {
    run();
} catch (error) {
    core.setFailed(error.message);
}
