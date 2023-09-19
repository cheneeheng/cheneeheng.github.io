---
author_profile: true
layout: single
permalink: /git/
title: "git"
last_modified_at: 2023-06-13T00:40:00-00:00
toc: true
---

\#TODO: INSERT A FIGURE

## What is git?
- It is an *"open source version control system"* \[1\] .
- You can think of it as a record book that tracks when/who/what *changes* were made inside a *repository*.
- It compares the binary files in the *repository* to find the *changes*. 
- *changes* include any file addition/modification/deletion.
- A *repository* is the folder where git is initialized, with the folder `.git` .
- *changes* in the repository are *committed* to create a new version of the *repository* with a unique commit ID.
- You can think of a commit as an entry in the record book.
- Once *committed*, you can always get an exact version of the repository at the time of the commit. Pretty cool huh? 

## So how do I use git?
- Setup git \[2\]. The name and email are used to indicate who made the changes in the repository.  
`git config --global user.name INSERT_NAME_HERE`  
`git config --global user.email INSERT_EMAIL_HERE`
- Initialize a folder as a repository with branch name `main`. It should create a `.git` folder.  
`git init -b main`  
- Check the status of the repository.  
`git status`  
- Add files for commit.  
`git add .`  
`git add -u` &larr; only add files that are previously added
- Commit the added files. As mentioned above, commit is where changes are recorded.  
`git commit -m "INSERT_COMMIT_MESSAGE"`  
`git commit` &larr; opens an editor to write the commit message
- Store the changes remotely  
`git push`  
- Get the remote changes  
`git pull` &larr; merge local changes with remote changes, may cause conflict  
`git pull --rebase` &larr; get the remote changes and apply local changes to it  
- Initialize a local repository with branch `main` and push to remote  
```  
git init  
git add .
git commit -m "INSERT_COMMIT_MESSAGE"
git branch -M main  # Only needed if -b flag not used in git init
git remote add origin git@github.com:USERNAME/REPO_NAME.git
git push -u origin main
```  
- List branches  
`git branch`  
- Create a new branch  
`git branch BRANCH_NAME`  
- Rename current branch to BRANCH_NAME  
`git branch -M BRANCH_NAME`  
- Switch branch  
`git checkout BRANCH_NAME`  
- Merge branch B into branch A  
`git checkout BRANCH_A`  
`git merge BRANCH_B`  
- Delete branch  
`git branch -d BRANCH_NAME` &larr; delete local branch  
`git push origin --delete BRANCH_NAME` &larr; delete remote branch  
`git fetch -p` &larr; sync changes  


## Is that all there is to git?
Of course not. There is an entire [website](https://git-scm.com) \[1\] dedicated to it !!! But the info here is the bare basic to get you started with git. If something goes wrong, git usually tells you what went wrong and possible solutions to fix it.

## References
[1] Official website: [https://git-scm.com](https://git-scm.com)  
[2] How to install git on Ubuntu22.04 from digitalocean:  
[https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-22-04](https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-22-04)  
[3] Git pull commands from KIT: [https://sdq.kastel.kit.edu/wiki/Git...](https://sdq.kastel.kit.edu/wiki/Git_pull_--rebase_vs._--merge)  
