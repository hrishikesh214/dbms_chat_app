drop database if exists `dbms_chat`;
create database if not exists `dbms_chat`;
use `dbms_chat`;

-- drop table if exists messages;
-- drop table if exists chats;
-- drop table if exists people;

create table if not exists people(
    id int primary key auto_increment,
    username varchar(30) not null,
    password varchar(30) not null,
    status int not null default 0,
    to_refresh int not null default 0,
    time timestamp not null default current_timestamp
);

create table if not exists chats(
    id int primary key auto_increment,
    p1 int not null,
    p2 int not null,
    last_msg text,
    last_msg_time timestamp not null default current_timestamp,
    un1 int not null default 0,
    un2 int not null default 0,
    foreign key (p1) references people(id),
    foreign key (p2) references people(id)
);

create table if not exists messages(
    id int primary key auto_increment,
    chat_id int not null,
    sender_id int not null,
    msg text not null,
    sent_at timestamp not null default current_timestamp,
    foreign key (chat_id) references chats(id),
    foreign key (sender_id) references people(id)
);

create table if not exists starred_messages(
    msg_id int,
    user_id int not null,
    foreign key (msg_id) references messages(id) on delete cascade,
    foreign key (user_id) references people(id)
);

create table if not exists deleted_messages(
    msg_id int primary key,
    chat_id int not null,
    content text not null,
    sent_by int not null,
    deleted_at timestamp not null default current_timestamp
);

-- dummy insert
insert into people(username, password) values("hrishi", "hrishi"), ("admin", "admin");
insert into chats(p1, p2) values(1, 2);

-- trigger

-- on message trigger to set refresh
drop trigger if exists on_message;
delimiter //
create trigger on_message after insert on messages
for each row
begin
    declare p1_id int;
    declare p2_id int;
    declare rec_id int;
    declare c_id int;
    set c_id = new.chat_id;
    select get_chat_reciever_id(c_id, new.sender_id) into rec_id;
    select p1, p2 into p1_id, p2_id from chats where id = c_id;
    if rec_id = p1_id then
        update chats set 
            last_msg = new.msg, 
            last_msg_time = new.sent_at, 
            un1 = un1 + 1 
            where id = new.chat_id;
    else
    update chats set 
        last_msg = new.msg, 
        last_msg_time = new.sent_at, 
        un2 = un2 + 1 
        where id = new.chat_id;
    end if;
    update people set to_refresh = 1 where id = rec_id;
end//
delimiter ;

-- on chat trigger to set refresh
drop trigger if exists on_chat;
delimiter //
create trigger on_chat after insert on chats
    for each row
    begin
    declare p1_id, p2_id int;
    set p1_id = new.p1;
    set p2_id = new.p2;
    update people set to_refresh = 1 where id = p1_id or id = p2_id;
    end//
delimiter ;

-- on message delete log it
drop trigger if exists on_message_delete;
delimiter //
create trigger on_message_delete after delete on messages
    for each row
    begin
    declare nc text default "";
    declare nt timestamp default current_timestamp;
    declare p2_id int default 0;
    insert into deleted_messages(msg_id, chat_id, content, sent_by) values(old.id, old.chat_id, old.msg, old.sender_id);
    select msg, sent_at into nc, nt from messages where chat_id = old.chat_id order by sent_at desc limit 1;
    update chats set last_msg = nc, last_msg_time = nt where id = old.chat_id;
    select get_chat_reciever_id(old.chat_id, old.sender_id) into p2_id;
    update people set to_refresh = 1 where id = old.sender_id or id = p2_id;
    end//
delimiter ;

-- procedures

-- make a person online
drop procedure if exists make_online;
delimiter //
create procedure make_online(pid int)
begin
    declare done int default 0;
    declare pid2 int;
    declare reciever_selector cursor for select get_chat_reciever_id(id, pid) from chats where p1 = pid or p2 = pid;
    declare continue handler for not found set done = 1;
    update people set status = 1 where id = pid;
    open reciever_selector;
    repeat fetch reciever_selector into pid2;
    update people set to_refresh = 1 where id = pid2;
    until done 
    end repeat;
    close reciever_selector;
end//
delimiter ;

-- make a person offline
drop procedure if exists make_offline;
delimiter //
create procedure make_offline(pid int)
begin
    declare done int default 0;
    declare pid2 int;
    declare reciever_selector cursor for select get_chat_reciever_id(id, pid) from chats where p1 = pid or p2 = pid;
    declare continue handler for not found set done = 1;
    update people set status = 0 where id = pid;
    open reciever_selector;
    repeat fetch reciever_selector into pid2;
    update people set to_refresh = 1 where id = pid2;
    until done 
    end repeat;
    close reciever_selector;
end//
delimiter ;

-- delete message
drop procedure if exists delete_message;
delimiter //
create procedure delete_message(mid int)
begin
    delete from messages where id = mid;
    delete from starred_messages where msg_id = mid;
end//
delimiter ;

-- starrs messages for a person
drop procedure if exists star_message;
delimiter //
create procedure star_message(mid int, uid int)
begin
    insert into starred_messages(msg_id, user_id) values(mid, uid);
end//
delimiter ;

-- unstar messages for a person
drop procedure if exists unstar_message;
delimiter //
create procedure unstar_message(mid int, uid int)
begin
    delete from starred_messages where msg_id = mid and user_id = uid;
end//
delimiter ;

-- functions

-- check refresh for a person
drop function if exists check_refresh;
delimiter //
create function check_refresh(pid int)
returns int
begin
    declare r int;
    select to_refresh into r from people where id = pid;
    return r;
end//
delimiter ;

-- make signup
drop function if exists make_signup;
delimiter //
create function make_signup(uname varchar(30), pass varchar(30))
returns int
begin
    declare pid int default 0;
    insert into people(username, password) values(uname, pass);
    select LAST_INSERT_ID() into pid;
    call make_online(pid);
    return pid;
end//
delimiter ;

-- check login return id
drop function if exists make_login;
delimiter //
create function make_login(uname varchar(30), pass varchar(30))
returns int
begin
    declare pid int default 0;
    select id into pid from people where username = uname and password = pass;
    if pid > 0 then
    call make_online(pid);
    end if;
    return pid;
end//
delimiter ;

-- get unername from id
drop function if exists get_username;
delimiter //
create function get_username(pid int)
returns varchar(30)
begin
    declare un varchar(30) default "NULL";
    select username into un from people where id = pid;
    return un;
end//

-- make a person update a chat list
drop function if exists chatlist_refresh;
delimiter //
create function chatlist_refresh(pid int)
returns int
begin
    declare r int;
    select to_refresh into r from people where id = pid;
    update people set to_refresh = 0 where id = pid;
    return r;
end//
delimiter ;

-- get another person from chat and person
drop function if exists get_chat_reciever;
delimiter //
create function get_chat_reciever(cid int, pid int)
returns varchar(30)
begin
    declare uname varchar(30);
    declare s_id int;
    select p1 into s_id from chats where id = cid;
    if pid = s_id then
        select get_username(p2) into uname from chats where id = cid;
    else
        select get_username(p1) into uname from chats where id = cid;
    end if;
    return uname;
end//
delimiter ;

-- get another person id from chat and person
drop function if exists get_chat_reciever_id;
delimiter //
create function get_chat_reciever_id(cid int, pid int)
returns int
begin
    declare uid1 int;
    declare s_id int;
    select p1 into s_id from chats where id = cid;
    if pid = s_id then
        select p2 into uid1 from chats where id = cid;
    else
        select p1 into uid1 from chats where id = cid;
    end if;
    return uid1;
end//
delimiter ;

-- get another person status from chat and person
drop function if exists get_chat_reciever_status;
delimiter //
create function get_chat_reciever_status(cid int, pid int)
returns int
begin
    declare uid1 int;
    declare st int default 0;
    declare s_id int;
    select p1 into s_id from chats where id = cid;
    if pid = s_id then
        select p2 into uid1 from chats where id = cid;
    else
        select p1 into uid1 from chats where id = cid;
    end if;
    select status into st from people where id = uid1;
    return st;
end//
delimiter ;

-- make a person read a chat
drop function if exists chat_refresh;
delimiter //
create function chat_refresh(cid int, pid int)
returns int
begin
    declare unc int;
    declare s_id int;
    select p1 into s_id from chats where id = cid;
    if pid = s_id then
        select un1 into unc from chats where id = cid;
        update chats set un1 = 0 where id = cid;
    else
        select un2 into unc from chats where id = cid;
        update chats set un2 = 0 where id = cid;
    end if;
    return unc;
end//
delimiter ;

-- make a new chat
drop function if exists make_chat;
delimiter //
create function make_chat(pid1 int, pid2 int)
returns int
begin
    declare cid int default 0;
    declare tid int default 0;
    select  count(*) into  cid from chats where (p1 = pid1 and p2 = pid2) or (p1 = pid2 and p2 = pid1);
    if cid = 0 then
        insert into chats(p1, p2) values(pid1, pid2);
        select LAST_INSERT_ID() into cid;
    else
        select id into cid from chats where (p1 = pid1 and p2 = pid2) or (p1 = pid2 and p2 = pid1);
    end if;
    update people set to_refresh = 1 where id = pid1 or id = pid2;
    return cid;
end//
delimiter ;

-- send messages to a chat
drop function if exists send_message;
delimiter //
create function send_message(cid int, sender_id int, msg text)
returns int
begin
    declare mid int default 0;
    insert into messages(chat_id, sender_id, msg) values(cid, sender_id, msg);
    select LAST_INSERT_ID() into mid;
    return mid;
end//
delimiter ;

-- check if a message is starred for a person
drop function if exists check_starred;
delimiter //
create function check_starred(mid int, pid int)
returns int
begin
    declare r int default 0;
    select count(*) into r from starred_messages where msg_id = mid and user_id = pid;
    return r;
end//
delimiter ;
