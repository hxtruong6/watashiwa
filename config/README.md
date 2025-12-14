
# Google Cloud Storage CORS Configuration

- Upload gcs_cors.json to GCS bucket

```sh
gcloud storage buckets update gs://YOUR_BUCKET_NAME --cors-file=cors.json
❯ gcloud storage buckets update gs://watashiwa_app --cors-file=config/gcs_cors.json
```

- Verify it worked

```sh
gcloud storage buckets describe gs://YOUR_BUCKET_NAME --format="default(cors_config)"

❯ gcloud storage buckets describe gs://watashiwa_app --format="default(cors_config)"
```

Make ONLY the "avatars" folder Public (Best for Security)
If you want avatars/ to be public but cards/ to remain private (secure), you must use an IAM Condition. This effectively creates a "Public Folder."

Go to the Permissions tab.

Click Grant Access.

In "New principals", type: allUsers

In "Select a role", choose: Storage Object Viewer.

DO NOT click Save yet. Instead, click Add IAM Condition.

Fill in the condition:

Title: Public Avatars Only

Condition Editor: select Name (under Resource) -> Starts with -> projects/_/buckets/watashiwa_app/objects/avatars/

(Note: Make sure to include the trailing slash / after avatars)

Click Save.

Result:

<https://storage.../avatars/me.jpg> -> Accessible ✅

<https://storage.../cards/secret.png> -> Access Denied 🔒
