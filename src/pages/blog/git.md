---
layout: ../../layouts/BlogPost.astro
title: git
date: 2023-06-13
description: A short primer on git — what it is, how to use it, and the basic commands to get started.
---

## What is git?

- It is an *open source version control system* [^1].
- You can think of it as a record book that tracks when / who / what *changes* were made inside a *repository*.
- It compares the binary files in the *repository* to find the *changes*.
- *Changes* include any file addition, modification, or deletion.
- A *repository* is the folder where git is initialized, with the folder `.git`.
- *Changes* in the repository are *committed* to create a new version of the *repository* with a unique commit ID.
- You can think of a commit as an entry in the record book.
- Once *committed*, you can always get an exact version of the repository at the time of the commit. Pretty cool.

## So how do I use git?

- Set up git [^2]. The name and email are used to indicate who made the changes in the repository.
  ```bash
  git config --global user.name INSERT_NAME_HERE
  git config --global user.email INSERT_EMAIL_HERE
  ```
- Initialize a folder as a repository with branch name `main`. It should create a `.git` folder.
  ```bash
  git init -b main
  ```
- Check the status of the repository.
  ```bash
  git status
  ```
- Add files for commit.
  ```bash
  git add .
  git add -u   # only add files that are previously tracked
  ```
- Commit the added files. As mentioned above, a commit is where changes are recorded.
  ```bash
  git commit -m "INSERT_COMMIT_MESSAGE"
  git commit   # opens an editor to write the commit message
  ```
- Store the changes remotely.
  ```bash
  git push
  ```
- Get the remote changes.
  ```bash
  git pull              # merge local changes with remote changes, may cause conflict
  git pull --rebase     # get the remote changes and replay local changes on top
  ```
- Initialize a local repository with branch `main` and push to remote.
  ```bash
  git init
  git add .
  git commit -m "INSERT_COMMIT_MESSAGE"
  git branch -M main   # only needed if -b flag not used in git init
  git remote add origin git@github.com:USERNAME/REPO_NAME.git
  git push -u origin main
  ```
- List branches.
  ```bash
  git branch
  ```
- Create a new branch.
  ```bash
  git branch BRANCH_NAME
  ```
- Rename current branch to `BRANCH_NAME`.
  ```bash
  git branch -M BRANCH_NAME
  ```
- Switch branch.
  ```bash
  git checkout BRANCH_NAME
  ```
- Merge branch B into branch A.
  ```bash
  git checkout BRANCH_A
  git merge BRANCH_B
  ```
- Delete branch.
  ```bash
  git branch -d BRANCH_NAME              # delete local branch
  git push origin --delete BRANCH_NAME   # delete remote branch
  git fetch -p                           # sync changes
  ```

## Is that all there is to git?

Of course not. There is an entire [website](https://git-scm.com) dedicated to it. But the info here is the bare minimum to get you started. If something goes wrong, git usually tells you what went wrong and possible solutions to fix it.

## References

[^1]: Official website: <https://git-scm.com>
[^2]: How to install git on Ubuntu 22.04 from DigitalOcean: <https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-22-04>

- Git pull commands from KIT: <https://sdq.kastel.kit.edu/wiki/Git_pull_--rebase_vs._--merge>
