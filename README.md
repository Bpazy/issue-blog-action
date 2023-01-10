# issue-blog-action
Write blogs with `Github Issues`. The Action helps you display your blogs on `README.md`.

**Example preview:** [Bpazy/blog](https://github.com/Bpazy/blog)

## Usage
1. First append `<!--START_SECTION:blog-->` and `<!--END_SECTION:blog-->` into your README. Like this:
```
<!--START_SECTION:blog-->

<!--END_SECTION:blog-->
```
2. And then create Github Actions profile like this:
```yaml
name: Update latest blog

on:
  workflow_dispatch:
  schedule:
    - cron:  '0,30 * * * *'

jobs:
  build:
    runs-on: ubuntu-latest
    name: Update latest blog
    steps:
      - uses: actions/checkout@v3
      - uses: Bpazy/issue-blog-action@v1.0.2 # Bpazy/issue-blog-action@master for beta
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

| All inputs     | Description                                                           | Default                                      |
|----------------|-----------------------------------------------------------------------|----------------------------------------------|
| GITHUB_TOKEN   | Token for commit file. Should always be `${{ secrets.GITHUB_TOKEN }}` | ${{ secrets.GITHUB_TOKEN }}                  |
| COMMIT_MSG     | Message when update issue activity                                    | Update README with the recent issue activity |
| NUMBER         | Issues number. Max: 100                                               | 20                                           |
| SUMMARY_LENGTH | Summary default char length                                           | 100                                          |
| OWNER          | Github owner                                                          | Current owner                                |
| REPO           | Github repo                                                           | Current repo                                 |

## Development dependency

```sh
npm install -g @vercel/ncc
npm install
npm run compile
```
