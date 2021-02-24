import React from "react";
import {Text,View,TouchableOpacity,StyleSheet,Image,KeyboardAvoidingView,ToastAndroid} from "react-native";
import * as Permissions from "expo-permissions";
import {BarCodeScanner} from "expo-barcode-scanner";
import { TextInput } from "react-native-gesture-handler";
import * as firebase from 'firebase';
import db from '../config'

export default class Transactionscreen extends React.Component{
    constructor(){
        super();
        this.state={
        hasCameraPermissions:null,
        scanned:false,
        scannedData:"",
        buttonState:"normal",
        scannedBookId:"",
        scannedStudentId:"",
        transactionMessage:""
        }
    }
    getCameraPermissions=async(id)=>{
        const {status}=await Permissions.askAsync(Permissions.CAMERA);
        this.setState({
            hasCameraPermissions:status==="granted",

            buttonState:id,
            scanned:false
        })
    }
    initiateBookIssue = async ()=>{
        //add a transaction
        db.collection("transaction").add({
          'studentId' : this.state.scannedStudentId,
          'bookId' : this.state.scannedBookId,
          'data' : firebase.firestore.Timestamp.now().toDate(),
          'transactionType' : "Issue"
        })
    
        //change book status
        db.collection("books").doc(this.state.scannedBookId).update({
          'bookAvailability' : false
        })
        //change number of issued books for student
        db.collection("students").doc(this.state.scannedStudentId).update({
          'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(1)
        })
    
        this.setState({
          scannedStudentId : '',
          scannedBookId: ''
        })
      }
    
      initiateBookReturn = async ()=>{
        //add a transaction
        db.collection("transactions").add({
          'studentId' : this.state.scannedStudentId,
          'bookId' : this.state.scannedBookId,
          'date'   : firebase.firestore.Timestamp.now().toDate(),
          'transactionType' : "Return"
        })
    
        //change book status
        db.collection("books").doc(this.state.scannedBookId).update({
          'bookAvailability' : true
        })
    
        //change book status
        db.collection("students").doc(this.state.scannedStudentId).update({
          'numberOfBooksIssued' : firebase.firestore.FieldValue.increment(-1)
        })
    
        this.setState({
          scannedStudentId : '',
          scannedBookId : ''
        })
      }
    handleTransaction=()=>{
      var transactionMessage
      db.collection("books").doc(this.state.scannedBookId).get().then((doc)=>{
          var book=doc.data()
          if(book.bookAvailability){
              this.initiateBookIssue();
           transactionMessage="book issued"
           ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
          }
          else{
              this.initiateBookReturn();
              transactionMessage="book returned"
              ToastAndroid.show(transactionMessage,ToastAndroid.SHORT)
          }
      })
      this.setState({transactionMessage:transactionMessage})
    }
    handleBarCodeScanned=async({type,data})=>{
        const {buttonState}=this.state
if(buttonState==="Book Id"){
    this.setState({scanned:true,scannedBookId:data,buttonState:"normal"})
    
}
if(buttonState==="Student Id"){
    this.setState({scanned:true,scannedStudentId:data,buttonState:"normal"})
    
}   
    }
render(){
    const hasCameraPermissions=this.state.hasCameraPermissions;
    const scanned=this.state.scanned;
    const buttonState=this.state.buttonState;
   if( buttonState!=="normal"&&hasCameraPermissions){
    return(
        <BarCodeScanner 
        onBarCodeScanned={scanned?undefined:this.handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
        />
    )
   }
   else if(buttonState==="normal"){
    return(
        <KeyboardAvoidingView style={styles.container} behavior="padding" enabled>
        <View style={styles.container}>
            <View><Image source={require("../assets/booklogo.jpg")}
            style={{width:200,height:200}}
            /><Text style={{textAlign:"center",fontSize:30}}>WILLY</Text></View>
            <View style={styles.inputView}>
                <TextInput style={styles.inputBox}
                placeholder="Book ID"
                onChangeText={ text => this.setState({scannedBookId:text})}
                value={this.state.scannedBookId}
                />
            <TouchableOpacity style={styles.scanButton} onPress={()=>{this.getCameraPermissions("Book Id")}}>
                <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
                <TextInput style={styles.inputBox}
                placeholder="Student ID"
                onChangeText={ text => this.setState({scannedStudentId:text})}
                value={this.state.scannedStudentId}
                />
            <TouchableOpacity style={styles.scanButton}onPress={()=>{this.getCameraPermissions("Student Id")}}>
                <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.SubmitButton} onPress={async()=>{
                this.handleTransaction();
                this.setState({
                    scannedBookId:'',
                    scannedStudentId:''
                })
            }}>
             <Text style={styles.SubmitButtonText}>Submit</Text>
            </TouchableOpacity>
            </View> 
        </View>
        </KeyboardAvoidingView>
    )
}
}
}
const styles=StyleSheet.create({
    container:{
        flex:1,justifyContent:'center',alignItems:'center'
    },
    displayText:{
        fontSize:15,
        textDecorationLine:"underline"
    },
    scanButton:{
        backgroundColor:"red",
        width:50,
        borderWidth:1.5,
        borderLeftWidth:0
    },
    buttonText:{
        fontSize:15,
        textAlign:"center",
        marginTop:10
    },
    inputView:{
        flexDirection:"row",
        margin:20
    },
    inputBox:{
        width:200,
        height:40,
        borderWidth:1.5,
        borderRightWidth:0,
        fontSize:20
    },
    SubmitButton:{
        backgroundColor:"black",
        width:100,
        height:50
    },
    SubmitButtonText:{
        padding:10,
        textAlign:"center",
        color:"white",
        textSize:20,
        fontWeight:"bold"
    }
})