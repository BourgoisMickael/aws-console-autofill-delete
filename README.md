# aws-console-autofill-delete
Chrome extension that automatically fill the confirmation message to delete a resource in AWS console

---

On AWS Console, when you want to delete a resource it asks you to type the resource name or a `delete` message. This behavior is really annoying.

So this extension listens for DOM Mutations and network requests to trigger the retrieval of confirmation text input and fill them accordingly.

### Usage

Go to `chrome://extensions/` then click `Load unpacked` and select this folder.
