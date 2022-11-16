# issue-blog-action
Display issue blog on README.

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
      - uses: Bpazy/issue-blog-action@v1.0.0 # Bpazy/issue-blog-action@master for beta
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Development dependency
```sh
npm install -g @vercel/ncc
npm install
npm run compile
```
