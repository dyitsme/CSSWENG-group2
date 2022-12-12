# I-FAMS User Guide
	________________






## Table of Contents


1 Introduction        3
1.1 Who can benefit from I-FAMS        3
1.2 Key features of I-FAMS        3
2 What’s inside        3
3 Requirements        3
3.1 Dependencies        3
3.2 Supported web browsers        4
4 Getting started        4
4.1 Install Node.js        4
4.2 Install MongoDB        8
4.3 Running the web application        12
5 Using the application        12
5.1 Application Information        12
5.1.1 Role descriptions        12
5.1.2 Page View and Navigation        13
The sections below will describe the features supported by each role.        14
5.2 Employee        14
5.2.1 Introduction        14
5.2.2 Downloading files        14
5.2.3 Searching items        15
5.2.4 Changing your password        16
5.3 Manager        17
5.3.1  Uploading files        17
5.3.2  Creating a new folder        19
5.3.4  Moving items        20
5.3.5  Renaming items        21
5.3.6  Deleting items        23
5.4 Administrator        24
5.4.1 Creating a user        24
5.4.2 Editing and deleting user’s properties        25


________________


## 1        Introduction
1. Sharing files between employees and managers is tedious as they would often send each the files through email, printed, or other modes of sending files. This would often be slow and expensive. If everything could be stored in a place, everyone gets access to them. The Ilagan File Management Server or I-FAMS is the tool for that,  a permission based centralized tool that provides managers to upload and share files between employees and managers.
1.1        Who can benefit from I-FAMS
* Employees who has access to files
* Managers who uploads files and chooses who gets to access those files


1.2        Key features of I-FAMS
* User friendly
* Login system
* File management
* File downloads
* Quick search
* Administrator tools for user management
## 2        What’s inside
* I-FAMS web application
* User manual
* Node.js installer
* MongoDB installer
## 3        Requirements
3.1        Dependencies
* Node.js version 16.14.2
* MongoDB latest version
3.2        Supported web browsers
* Google Chrome
* Microsoft Edge
* Opera


## 4        Getting started
4.1        Install Node.js


1. Press the next button once you see the welcome page.


  





2. Accept the terms in the End-User License Agreement.
  



3. By default, it installs the application in the Program Files folder, but you could choose wherever you could install it. Press the next button.


  

4. Leave the setup as is and press the next button.


  



5. Press the next button as this step is not needed.


  



6. When ready, install Node.js.


  



7. Once the application is installed, you could check it in the command prompt by typing node-v.


  

4.2        Install MongoDB




1. Press the next button after seeing the welcome page.


  



2. Accept the terms in the End-User License Agreement.


  



3. Choose a Complete Setup Type by pressing the Complete button.


  



4. Install MongoD as a service and run service as a Network Service User.


  



5. Install MongoDB Compass (optional).


  



6.  When ready, install MongoDB.


  



4.3        Running the web application
1. Go to the command prompt and type in the directory where the application is located.
2. Once you are in the application folder, type in node server.
3. Go to your browser and type in localhost:3000
4. The web application is now running


## 5        Using the application
5.1        Application Information
5.1.1 Role descriptions
There are 3 types of users that can use the application, each have access to features supported 
by their role. The following table below describes their features available based on their access.


Role
	Description
	Employee
	Has limited access. Can download and search available content. Can change their password.
	Manager
	Can download and search available content. Can upload, move, rename, and delete files. Can also create, move, and rename folders. Can change their password.
	

Administrator
	Has unrestricted access, Can download and search available content. Can upload, move, rename, and delete files. Can also create, move, and rename folders. Can create users, edit user access and password, and delete users.
	5.1.2 Page View and Navigation
        After logging in, the user will see the main menu where he/she can see an overview of all the files and functions in the server. If the user doesn’t see any files or folders, it's likely due to the database not having any uploaded files or folders. If the account role of the user is “Employee” then there may be files or folders that are not visible. If a user is a “Manager” or “Administrator” however, they will be able to see all files and folders in the database. Each file has a displayed filename, uploader name, uploaded date, and file size. Folders have similar information displayed except there is no file size displayed for folders. 


  



When a user wants to view the contents of a specific folder, the user can left-click the folder and the view will be redirected to the contents within the clicked folder. The user can view what folders he/she has access to through the access history/directory shown below the “Files” label. When the user wants to exit the folder view, there is a back button, with an arrow icon, located beside the access history/directory that will allow the user to return to the main menu view. 
  





From this menu page, the user can also perform a variety of functions depending on the account role of the user. Each function is done through the various buttons visible in the main menu. 
The sections below will describe the features supported by each role.
5.2        Employee
5.2.1        Introduction
1. Before logging in, please make sure to be registered by your administrator.


2. After being registered, you can enter in your username and password provided by your administrator in the username and password forms. Below is a sample that shows the login details filled up.


  



3. Once you are logged in, you are now ready to use the system.  
5.2.2        Downloading files
1. To download a file, right click on a file and select Download in the pop-up menu.


  



2. Alternatively, you can download multiple files by pressing Select, which will display a list of checkboxes for files you wish to download. 
  
  

5.2.3        Searching items
1. To search something, go to the search bar which is on the upper right corner of the page. The home page would display the contents based on what you have searched.
  

5.2.4        Changing your password
1. Go to the user profile page by clicking on Profile.


  

2. Once you are on the user page, click on Edit Password.
  

3. Here on the edit password page, you can set your new password by entering your old password and new password, make sure to confirm your new password.


  

5.3        Manager
5.3.1                Uploading files
1. To upload files, click Upload and you would be presented with a dialog that allows you to upload multiple files. 
2. Click on Choose Files. 


  



3. You can also remove files that you do not want to upload by clicking the button on the side.
  



4. Once you are ready to upload your files, click Upload. It will then upload the files onto the database.


5. You can also select whether you want to restrict access to Managers only.


  

5.3.2                Creating a new folder
1. Press New Folder to create a new folder


  

2. Enter your chosen folder name and preferred accessibility (Unrestricted, Admin/Manager Level).
3. When ready, press Create Folder.


  

5.3.4                Moving items
1. To move an item, hover over to an item and right click it. Select Move in the pop-up menu.


  

2. A window will appear showing the folders you wish the item to be moved to. 


  



3. Click on a folder you wish to to move an item to.
4. Once done, press Move Here.


  



5. Similarly, you can select multiple items to move to a certain folder. To do that, press Select and it would show a list of checkboxes on the list of items you wish to select.
6. Once you have selected your files, press Move Selected on the pop-up menu.


  

7. As mentioned earlier, it would display a window showing which folder you want to move your files into.
5.3.5                Renaming items
1. To rename a file, hover over to a file and right click it. Select Rename in the pop-up menu.


  

2. Enter your new file name
3. Once done, press Rename File


  



4. For folders, right-click on a folder and press rename displayed in the pop-up menu
5. Enter your new folder name.
6. Once done, press Rename Folder


  

5.3.6                Deleting items
1. To delete something, right-click on an item. Press Delete on the pop-up menu displayed.


  

2. Alternatively, you can delete multiple items by pressing Select. This would show a list of checkboxes for items you want to select.
3. Once you’re done selecting files you wish to delete, select Delete Selected
  

5.4        Administrator
5.4.1        Creating a user
1. To create a user, go to the user registration page by clicking Register a User.


  

2. Once you are in the user registration page, fill in the appropriate information to create a user, namely their username, password, and role. Once you are ready, you can click Create User.


  

5.4.2        Editing and deleting user’s properties
1. Go to the admin profile page.


  

2. Search the user you want to find by the username in the search bar.
  

3. Here, you can either change the user’s role (Employee or Manager) or password.
4. You can also delete the user by pressing Delete Account.