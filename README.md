# Github Collaboration

A web app to add collaborators themselves to a private GitHub repo.
This uses GitHub API for the same.

To use this application you have to generate a GitHub OAuth token [in the settings](https://github.com/settings/tokens) with repo scope.

The access to the application is guarded by a token which you shall keep secret and give only to the people whom you want to access.

This can be easily deployed to Heroku or OpenShift.

## Use
To access the page you have to send the token as `auth_token` query parameter. So, if you have deployed it at `https://xyz.apphost.com`, to access you have to give the address `https://xyz.apphost.com/?auth_token=your.auth.token`.

## Setup
For the application to work properly, you need to set appropriate environment variables.
- `TOKEN_HASH`         : The sha256 hash of the token by which the user can access the application.
- `REPO_NAME`          : The name of the private/public repo to which you want to add collaborators.
- `REPO_OWNER`         : The user/org which owns the target repo
- `GITHUB_OAUTH_TOKEN` : The _aes-256-ctr_ encrypted GitHub access token with password same as the application access token (before hashing). The token is encrypted so that application can be safely deployed in environments were you setting can be leaked to unauthorised persons without concerns about your token being leaked.
- `PORT`               : The port where the application shall listen on. Heroku automatically sets this env variable, but for other situations like testing, you need to set this.


To encrypt the GitHub OAuth token you can use the `encode` function that has been provided in index.js for reference.
