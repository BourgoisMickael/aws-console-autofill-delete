<p align="center"><img src="./assets/logo.png" alt="logo" /></p>

<h1 align="center">AWS Console autofill delete</h1>

<p align="center">
  <a href="https://chrome.google.com/webstore/detail/aws-console-autofill-dele/hmndplgjjgpdbcofbmbiejojppbgdbbg"><img alt="Chrome Extension" src="https://img.shields.io/chrome-web-store/v/hmndplgjjgpdbcofbmbiejojppbgdbbg"/></a>
  <a href="https://addons.mozilla.org/en-US/firefox/addon/aws-console-autofill-delete/"><img alt="Mozilla Add-on" src="https://img.shields.io/amo/v/aws-console-autofill-delete"/></a>
<p>

Tired of filling the deletion confirmation modal to delete a resource on AWS console ? This extension **automatically fills the input for you**. And it works in any language.

- [Install Chrome Extension](https://chrome.google.com/webstore/detail/aws-console-autofill-dele/hmndplgjjgpdbcofbmbiejojppbgdbbg)
- [Install Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/aws-console-autofill-delete/)


![Demo](./assets/aws_autofill_delete_demo.gif)

The automatic filling is implemented for more than **25** services, including:

- ACM
- Api Gateway
- Athena
- DynamoDB
- CloudWatch
- Cognito
- DocumentDB
- EC2
- EFS
- Elastic Beanstalk
- EventBridge
- IAM
- Kinesis (Firehose & Analytics)
- KMS
- Lambda
- Route53
- S3
- Single Sign-On
- SNS
- SQS
- VPC
- WAF

More services are to come. You can open an issue or contribute if you'd like a service to be implemented.

<br/>

# Description

The extension use [`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver) to listen for mutation in the page. Whenever the DOM changes, [`querySelector`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector) tries to find the input in a modal and the text to fill in that input.

<br>

# Building

```bash
npm run build
```

The built extension is located in `build/chrome.zip` and `build/firefox.zip`.

# Development

Here is how you can test the extension during development

## Chrome

Go to `chrome://extensions`, toggle **Developer mode** and click on **Load unpacked**, then select the folder `build/chrome/`.

## Firefox

Go to `about:debugging#/runtime/this-firefox`, click on **Load Temporary Add-on** and select either `build/firefox.zip` or any file in `build/firefox/`.

<br>

# Testing

You need an AWS account, then complete the file `cypress.env.json` like this:

```json
{
  "baseDomain": "YOUR_ACCOUNT_ALIAS",
  "username": "IAM_USERNAME",
  "password": "IAM_PASSWORD",
  "region": "eu-west-3"
}
```

To deploy required resources and run tests:

```bash
$ ./deploy.sh
$ npm i
$ npm run test:chrome
$ npm run test:firefox
```



