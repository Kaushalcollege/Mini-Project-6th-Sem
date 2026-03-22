create table users (
	id serial primary key,
	username varchar(50) unique not null,
	password_hash varchar(255) not null,
	role varchar(20) not null default 'student',
	civic_score integer default 100,
	created_at timestamp default current_timestamp
);

create table incidents (
	id serial primary key,
	user_id integer references users(id) on delete cascade,
	image_url varchar(255) not null,
	status varchar(20) not null default 'pending',
	location varchar(100),
	time_stamp timestamp default current_timestamp
);

create table detections (
    id serial primary key,
    incident_id integer references incidents(id) on delete cascade,
    class_name varchar(50) not null,
    confidence float not null,
    bbox_x float,
    bbox_y float,
    bbox_w float,
    bbox_h float
);

ALTER TABLE users ADD COLUMN email VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);