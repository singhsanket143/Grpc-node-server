const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('./todo.proto', {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
var todoService = protoDescriptor.TodoService;

// const todosProto = grpc.load('todo.proto');

const server = new grpc.Server();

const todos = [
    {
        id: '1', title: 'Todo1', content: 'Content of todo 1'
    },
    {
        id: '2', title: 'Todo2', content: 'Content of todo 2'
    }
];

server.addService(todoService.service, {
    listTodos: (call, callback) => {
        callback(null, {
            todos: todos
        });
    },
    createTodo: (call, callback) => {
        let incomingNewTodo = call.request;
        todos.push(incomingNewTodo);
        console.log(todos);
        callback(null, incomingNewTodo);
    },
    getTodo: (call, callback) => {
        let incomingTodoRequest = call.request;
        let todoId = incomingTodoRequest.id;
        const response = todos.filter((todo) => todo.id == todoId);
        if(response.length > 0) {
            callback(null, response);
        } else {
            callback({
                message: 'Todo not found'
            }, null);
        }
    }
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log("Started the server");
    server.start();
});