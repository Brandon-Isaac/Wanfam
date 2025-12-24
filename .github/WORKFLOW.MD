## WORKFLOWS
#### ENFORCE-DEV-MERGE.YAML
It enforces only the dev branch to be able to make cyhanges to the main branch.
Incase the main branch is selected in a Pull Request the action will fail and thereby prevent merging of the code to the main branch
Therefore, the PR must be created with dev as the base branch.
If already used main, a commit must be made after changing the base branch.