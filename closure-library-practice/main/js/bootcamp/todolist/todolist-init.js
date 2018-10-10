goog.require('wap.bootcamp.todolist.TodolistApp');
goog.require('wap.bootcamp.todolist.container.Application');
goog.require('wap.bootcamp.todolist.dao.ProjectDao');
goog.require('wap.bootcamp.todolist.dao.ProjectDaoMockImpl');
goog.require('wap.bootcamp.todolist.dao.TaskDao');
goog.require('wap.bootcamp.todolist.dao.TaskDaoMockImpl');
goog.require('wap.bootcamp.todolist.dao.mock');

goog.scope(function() {
  var application = new wap.bootcamp.todolist.container.Application();
  application.decorate(document.body);

  var daos = {
    projectDao: new wap.bootcamp.todolist.dao.ProjectDaoMockImpl(
      wap.bootcamp.todolist.dao.mock.PROJECTS,
      0
    ),
    taskDao: new wap.bootcamp.todolist.dao.TaskDaoMockImpl(
      wap.bootcamp.todolist.dao.mock.TASKS,
      0
    )
  };
  var todolistApp = new wap.bootcamp.todolist.TodolistApp(application, daos);
});
