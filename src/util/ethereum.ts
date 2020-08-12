import Web3  from "web3";
import { EventEmitter as Web3EventEmitter }  from "web3/types";
import { TransactionObject } from "web3/eth/types";

import {
  BigNumber
} from "./big-number";


type ContractImport = {
  contracts: {
    [filename: string]: {
      [classname: string]: ContractImportClass
    }
  }
}

type ContractImportClass = {
  abi: Array<any>,
  evm: {
    bytecode: {
      object:string
    }
  }
}

const EC_DEBUG = "ETHEREUM_CONTRACT:"

function findContract(web3: Web3, contractCode: string): Promise<Array<string>>{
  return Promise.resolve().then(()=>{
    return web3.eth.getBlockNumber()
  }).then((blockNumber)=>{
    console.log(EC_DEBUG, "TOTAL BLOCKNUMBER", blockNumber);
    const blocks: Array<any> = [];
    for(var i=0;i<=blockNumber;i++){
      blocks.push(
        getTestTransactionsFromBlock(i, contractCode)
      )
    }
    return Promise.all(blocks);
  }).then((contractsAddresses: Array<Array<string>>)=>{
    const addresses: Array<string> = contractsAddresses.reduce((allAddresses, blockAddresses)=>{
      return allAddresses.concat(blockAddresses)
    }, [])
    console.log("found addresses:",addresses)
    return addresses
  })

  function getTestTransactionsFromBlock(blockNumber: number, contractCode: string){
    return web3.eth.getBlockTransactionCount(blockNumber).then((transCount)=>{
      console.log(EC_DEBUG, "blockNumber:", blockNumber, ", TOTAL TRANSACTION COUNT:", transCount);
      const ps: Array<Promise<false|string>> = [];
      for(var i=0;i<transCount;i++){
        ps.push(getAndTestTransaction(blockNumber, i, contractCode));
      }
      return Promise.all(ps);
    }).then((resolvedPromises: Array<false|string>)=>{
      return (
        resolvedPromises.filter((value)=>{
          console.log("test transaction", value)
          return value != false
        })
      )
    });
  }

  function getAndTestTransaction(
    blockNumber: number,
    transCount: number,
    contractCode: string
  ): Promise<false|string>{
    return Promise.resolve().then(()=>{
      return web3.eth.getTransactionFromBlock(blockNumber, transCount)
    }).then((transactionInfo)=>{
      if(transactionInfo.input === "0x"){
        console.log(
          EC_DEBUG, "blockNumber:", blockNumber,
          ", transactionCount:", transCount,
          "TRANSACTION HAS NO DATA"
        );
        return false
      }
      if(transactionInfo.to !== null){
        console.log(
          EC_DEBUG, "blockNumber:", blockNumber,
          ", transactionCount:", transCount,
          "TRANSACTION SENDS VALUE TO TARGET"
        );
        return false
      }
      return web3.eth.getTransactionReceipt(transactionInfo.hash).then((reciept)=>{
        console.log(
          EC_DEBUG, "blockNumber:", blockNumber,
          ", transactionCount:", transCount,
          "transactionReciept: ", reciept
        );

        if(!reciept.contractAddress){
          console.log(
            EC_DEBUG, "blockNumber:", blockNumber,
            ", transactionCount:", transCount,
            "transaction HAS NOT CONTRACT ADDRESS"
          );
          return false
        }
        return web3.eth.getCode(reciept.contractAddress).then((code)=>{
          console.log(
            EC_DEBUG, "blockNumber:", blockNumber,
            ", transactionCount:", transCount,
            "transactionCode: ", code
          );

          if(code.substring(2) !== contractCode.substring(64)){
            console.log(
              "TRANSACTION CODE IS DIFFERENT:",
              code, "0x" + contractCode
            );
            (window as any).ORIGINAL_CODE = contractCode;
            (window as any).NEW_CODE = code.substring(2);
            return false
          }
          console.log("code is the same")
          return reciept.contractAddress;
        })
      })
    })
  }
}


function tryToSendTransaction(web3: Web3, transaction: TransactionObject<any>){
  console.log("attempting to send");
  return Promise.all([
    transaction.estimateGas({ gas: 5000000000 }).then(
      (gas)=>{
        console.log("estimated gas:", gas);
        return gas;
      }, (error)=>{
        console.error("error on estimate gas");
        throw error;
      }
    ),
    web3.eth.getGasPrice(),
    web3.eth.getAccounts().then((accounts)=>{
      return web3.eth.getBalance(accounts[0]).then((balance)=>{
        return [accounts[0], balance]
      })
    }),
  ]).then(([gas, gasPrice, accountAndBalance])=>{
    const account = accountAndBalance[0];
    const balance = new BigNumber(accountAndBalance[1]);
    const gasCost = new BigNumber(gasPrice).multipliedBy(gas);
    const diff = balance.isGreaterThanOrEqualTo(gasCost);

    console.log("Transcaction Attempt:", balance, gasCost);
    if(!diff){
      throw new Error(
        "account balance: " + balance.toString(10) + " is less than cost of contract: " + gasCost.toString(10)
      )
    }
    return transaction.send({
      gas: gas,
      from: account
    })
  })

}


type getWeb3Args = {
  url: string,

  name: string,
};

export {
  Web3,
  Web3EventEmitter,
  TransactionObject,
  ContractImport,
  ContractImportClass,
  findContract,
  tryToSendTransaction,
}
