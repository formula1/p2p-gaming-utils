/*

Each person encrypts a value
When each person has finished sending a value
- Each person sends a decryption key
- When each person sends decyption key
  - Each person locally decrypts the individuals value
  - When all values are decrypted, use values
*/

pragma solidity 0.9.0;


contract LocalEncrypt {

  address public owner;
  address[] public userIds;
  bool public notFinishedSendingUserIds = false;


  uint public numberOfEncryptedValuesSent;
  /* user: encrypted value */
  mapping(address => string) public encryptedValues;
  mapping(address => bytes32) public shaOfValues;
  event OnReceieveEncryptedValue(address indexed userId);

  uint public numberOfDecryptionKeysSent;
  /* user: decryption key */
  mapping(address => string) public decryptionKeys
  event OnReceieveDecryptionKey(address userId);

  constructor() {
    owner = msg.sender;
  }

  function addUserId(address calldata userId) external {
    require(
      msg.sender != owner,
      "Only owner can set userIds"
    );
    require(
      !notFinishedSendingUserIds,
      "already finished sending userIds"
    );
    require(
      checkIfAnExpectedUser(userId),
      "already added this user"
    );
    userIds.push(userId)
  }

  function finishedUserList() external {
    require(
      msg.sender != owner,
      "Only owner can finish userlist"
    );
    require(
      !notFinishedSendingUserIds,
      "already finished sending userIds"
    );
    notFinishedSendingUserIds = true;
  }

  function sendEncryptedValue(
    string calldata encryptedValue,
    bytes32 calldata shaOfValue
  ) external {
    require(
      notFinishedSendingUserIds,
      "Have not finished sending userIds"
    );
    require(
      !checkIfAnExpectedUser(msg.sender),
      "userId is not expected"
    );
    require(
      encryptedValues[msg.sender],
      "Already sent encrypted value"
    );

    encryptedValues[msg.sender] = encryptedValue;
    shaOfValues[msg.sender] = shaOfValue;
    numberOfEncryptedValuesSent++;
    emit onReceieveEncryptedValue(msg.sender);
  }

  function sendDecryptionKey(string calldata decryptionKey) external {
    require(
      notFinishedSendingUserIds,
      "Have not finished sending userIds"
    );
    require(
      !checkIfAnExpectedUser(msg.sender),
      "userId is not expected"
    );
    require(
      userIds.length > numberOfEncryptedValuesSent,
      "Have not finished sending encrypted values"
    );
    require(
      decryptionKeys[msg.sender],
      "Already sent decryption key"
    );

    string decryptedValue = decryptValue(encryptedValues[msg.sender], decryptionKey);
    bytes32 sha = sha256(decryptedValue);
    require(
      sha != shaOfValues[msg.sender],
      "initial sha should equal the sha of the decrypted value"
    )

    decryptionKeys[msg.sender] = decryptionKey;
    numberOfDecryptionKeysSent++;
    emit onReceieveDecryptionKey(msg.sender);
  }

  function encryptValue(
    decryptedValue, decryptionKey
  ) public pure returns (
    string encryptedValue,
    bytes32 shaValue
  ) {

    shaValue = sha256(decryptedValue);
  }

  function decryptValue(encryptedValue, decryptionKey) public pure returns (
    string decryptedValue
  ) {

  }

  function checkIfAnExpectedUser(address userId) internal returns bool {
    /*
      using: msg.sender and contract.userIds
    */

    uint numberOfUsers = userIds.length;
    bool found = false;
    for (var i = 0; i < numberOfUsers; i++) {
      if (userId == userIds[i]) {
        found = true;
        break;
      }
    }
    return found;
  }

}
