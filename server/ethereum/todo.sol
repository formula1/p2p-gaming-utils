pragma solidity  0.5.12;

import "./arrayops.sol";


contract TodoLists {

    struct Todo {
        uint _id;
        address owner;
        string description;
        uint created;
        uint finished;
    }

    uint private todoIdValue;

    event ChangeEvent(uint indexed b);

    // event CreateEvent(uint indexed b);
    // event UpdateEvent(uint indexed b);
    // event DeleteEvent(uint indexed b);

    // mapping(address => uint[]) public ownerIndex;
    uint[] public allTodos;
    mapping(uint => Todo) public todos;
    constructor() public {}

    function createItem(string calldata description) external {
        todoIdValue = todoIdValue + 1;
        todos[todoIdValue] = Todo(
            todoIdValue,
            msg.sender,
            description,
            block.timestamp,
            0
        );
        // ownerIndex[msg.sender].push(todoIdValue);
        allTodos.push(todoIdValue);
        // CreateEvent(todoIdValue)
        emit ChangeEvent(todoIdValue);
    }

    function uFinishItem(uint todoIdIn) external {
        Todo storage todo = todos[todoIdIn];
        require(todo.owner == msg.sender, "Sender of todo needs to be owner");
        require(todo.finished == 0, "todo cannot be finished");
        todo.finished = block.timestamp;
        // UpdateEvent(todoIdIn);
        emit ChangeEvent(todoIdValue);

    }

    function deleteItem(uint todoIdIn)  external {
        Todo storage todo = todos[todoIdIn];
        require(todo.owner == msg.sender, "Sender of todo needs to be owner");
        delete todos[todoIdIn];
        ArrayOps.deleteFromIndex(allTodos, todoIdIn);
        // DeleteEvent(todoIdIn);
        emit ChangeEvent(todoIdValue);
    }

    function requestItemCount() external view returns (uint todoIds) {
        return allTodos.length;
    }
    // 
    // function requestItemList() external view returns (uint[] memory todoIds) {
    //     todoIds = ownerIndex[msg.sender];
    // }

    function requestItemSingle(uint todoIdIn) external view returns(
        uint _id,
        address owner,
        string memory description,
        uint created,
        uint finished
    ) {
        Todo memory todo = todos[todoIdIn];
        _id = todo._id;
        owner = todo.owner;
        description = todo.description;
        created = todo.created;
        finished = todo.finished;
    }

}
