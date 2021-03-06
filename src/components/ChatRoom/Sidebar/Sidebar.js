import { React, useState, useEffect, useRef, memo } from "react";
import "./Sidebar.css";
import { Link, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../../redux/actions/authActions';
import { deleteConversation, fetchConversations, resetConversations } from '../../../redux/actions/chatActions';
import { fetchContacts } from '../../../redux/actions/contactsActions';
import SidebarChat from "./SidebarChat/SidebarChat";
import SidebarDropdown from './SidebarDropdown/SidebarDropdown';
//* Material
import ChatIcon from "@material-ui/icons/Chat";
import { IconButton, Avatar } from "@material-ui/core";
import { DeleteOutline, MeetingRoomOutlined, SearchOutlined } from "@material-ui/icons";



//{ Called from ChatRoom.jsx, PrivateChatRoom.jsx
const Sidebar = memo(() => {
  //* Estado Local
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const inputSearchRef = useRef();
  //* Estado Global
  const { user } = useSelector(state => state.auth);
  const { atLeastOneConversationSelected, ownConversations } = useSelector(state => state.chat);
  const { contacts, userApp } = useSelector(state => state.contacts);
  const dispatch = useDispatch();
  const history = useHistory();


  useEffect(() => {
    //*-------------------------------- Contacts --------------------------------*//
    (async function() {
      try{
        const baseURL = 'https://academlo-whats.herokuapp.com/api/v1/users';
        await dispatch(fetchContacts(baseURL, user.uid));
        getConversations();
      }catch(error){
        alert(error.message);
      }
    })();
    //*------------------------------ Conversations -----------------------------*//
    const getConversations = async() => {
      try{
        const baseURL = `https://academlo-whats.herokuapp.com/api/v1/users/${user.uid}/conversations`;
        await dispatch(fetchConversations(baseURL));
      }catch(error){
        alert(error.message);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logoutUser = async () => {
    try {
      const message = await dispatch(logout()); //authActions.js
      alert(message); //! DESPEDIDA
      history.push("/");
    } catch(error) {
      alert(error.message);
    }
  };

  const handleFocus = () => {
    const inputSearch = inputSearchRef.current;
    if(!showDropdown) {
      inputSearch.focus();
      setShowDropdown(true);
    } else {
      inputSearch.blur();
      inputSearch.value = "";
      setSearchUser("");
      setShowDropdown(false);
    }
  };

  const handleSearchUser = (e) => {
    const inputSearch = inputSearchRef.current;
    setSearchUser(inputSearch.value);
  };

  const removeConversation = () => {
    ownConversations.forEach( async(conversation) =>{
      try{
        const conversationsLastPosition = ownConversations.length - 1;
        if(conversation.conversationSelected === true){
          await dispatch(deleteConversation(conversation._id));
        }
        if(conversation._id === ownConversations[conversationsLastPosition]._id){
          const baseURL = `https://academlo-whats.herokuapp.com/api/v1/users/${userApp[0].uid}/conversations`;
          await dispatch(fetchConversations(baseURL));
        };
        dispatch(resetConversations());
      }catch(error){
        alert(`Chat: removeConversation er => ${error.message}`);
      }
    });
  };


  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <Avatar src={user.photoURL} />
        <div className="sidebar__headerRight">
          {atLeastOneConversationSelected && 
            <IconButton onClick={removeConversation}>
              <DeleteOutline/>
            </IconButton>
          }
          <IconButton onClick={handleFocus}>
            <ChatIcon />
          </IconButton>
          <IconButton onClick={logoutUser}>
          <MeetingRoomOutlined/>
          </IconButton>
        </div>
      </div>
      <div className="sidebar__search">
        <div className="sidebar__searchContainer">
          <SearchOutlined />
          <input
            placeholder={`${showDropdown ? "Busca o inicia un chat" : "Da clic en icono de mensaje"}`}
            type="text"
            ref={inputSearchRef}
            onChange={handleSearchUser}
          />
        </div>
      </div>
      <div className="sidebar__chats">
        {
          showDropdown ?
            contacts.filter(contact => 
              contact.username.toLowerCase().includes(searchUser.toLowerCase())
            ).map((contact , i) => {
              return (
                <SidebarDropdown key={i} photo={contact.photoUrl} firstName={contact.firstName} lastName={contact.lastName} id={contact._id} handleFocusFn={handleFocus} />
              )
            })          
          :
            ownConversations.map((conversation, i) => {
              const myconversation = conversation.members.find( member => member === userApp[0]._id);
              if(conversation.membersObj) {
                  if(myconversation) {
                    const chatUser = conversation.membersObj.find(member => member._id !== userApp[0]._id);
                    return (
                      <Link key={i} style={{textDecoration: 'none', color: 'black'}} to={`/chat/${conversation._id}`}>
                        <SidebarChat key={i} photo={chatUser.photoUrl} userName={chatUser.username} conversationId={conversation._id} conversationSelected={conversation.conversationSelected} />
                      </Link>
                    )
                  }
                return true;
              } else {
                return (
                  <SidebarChat key={i} />
                )
              }
            })         
        }
      </div>
    </div>
  );
});



export default Sidebar;
