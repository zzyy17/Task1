goog.provide('wap.bootcamp.todolist.dao.mock');

goog.require('wap.bootcamp.todolist.dto.Project');
goog.require('wap.bootcamp.todolist.dto.Task');


/** @type {Array.<wap.bootcamp.todolist.dto.Project>} */
wap.bootcamp.todolist.dao.mock.PROJECTS = [
  {
    id: 1,
    title: 'Client Side'
  }, {
    id: 3,
    title: 'Server Side'
  }, {
    id: 9999,
    title: '<script>alert(\'XSS\');</script>'
  }
];


/** @type {Array.<wap.bootcamp.todolist.dto.Task>} */
wap.bootcamp.todolist.dao.mock.TASKS = [
  {
    id: 1,
    projectId: 1,
    title: 'Intermediate (CS-I)',
    done: true
  }, {
    id: 10,
    projectId: 1,
    title: 'Advanced (CS-A)',
    done: false
  }, {
    id: 3,
    projectId: 3,
    title: 'Intermediate (SS-I)',
    done: false
  }, {
    id: 4,
    projectId: 3,
    title: 'Advanced (SS-A)',
    done: false
  }, {
    id: 5,
    projectId: 3,
    title: '<script>alert(\'XSS\');</script>',
    done: true
  }
];
