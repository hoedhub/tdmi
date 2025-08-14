CREATE TABLE "__drizzle_migrations" (                                                                      
			id SERIAL PRIMARY KEY,                                                                                     
			hash text NOT NULL,                                                                                        
			created_at numeric                                                                                         
		);                                                                                                         
CREATE TABLE `deskel` (                                                                                    
    `id` integer PRIMARY KEY NOT NULL,                                                                     
    `id_kecamatan` integer NOT NULL,                                                                       
    `deskel` text NOT NULL,                                                                                
    FOREIGN KEY (`id_kecamatan`) REFERENCES `kecamatan` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION     
  );                                                                                                       
CREATE TABLE `kecamatan` (                                                                                 
    `id` integer PRIMARY KEY NOT NULL,                                                                     
    `id_kokab` integer NOT NULL,                                                                           
    `kecamatan` text NOT NULL,                                                                             
    FOREIGN KEY (`id_kokab`) REFERENCES `kokab` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION             
  );                                                                                                       
CREATE INDEX `kecamatan_idx` ON `kecamatan` (`kecamatan`);                                                 
CREATE TABLE `kokab` (                                                                                     
    `id` integer PRIMARY KEY NOT NULL,                                                                     
    `id_prop` integer NOT NULL,                                                                            
    `kokab` text NOT NULL,                                                                                 
    FOREIGN KEY (`id_prop`) REFERENCES `prop` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION               
  );                                                                                                       
CREATE INDEX `kokab_idx` ON `kokab` (`kokab`);                                                             
CREATE TABLE "murid" (                                                                                     
    "id" integer PRIMARY KEY NOT NULL,                                                                     
    "updated_at" text DEFAULT CURRENT_TIMESTAMP NOT NULL,                                                  
    "updater_id" text NOT NULL,                                                                            
    "nama" text NOT NULL,                                                                                  
    "nama_arab" text,                                                                                      
    "gender" integer DEFAULT true NOT NULL, -- Nama kolom sudah benar                                      
    "deskel_id" integer,                                                                                   
    "alamat" text,                                                                                         
    "nomor_telepon" text,                                                                                  
    "muhrim_id" integer,                                                                                   
    "mursyid_id" integer,                                                                                  
    "baiat_id" integer,                                                                                    
    "wirid_id" integer,                                                                                    
    "qari" integer DEFAULT true NOT NULL,                                                                  
    "marhalah" integer DEFAULT 1 NOT NULL,                                                                 
    "tgl_lahir" text,                                                                                      
    "aktif" integer DEFAULT true NOT NULL,                                                                 
    "partisipasi" integer DEFAULT true NOT NULL,                                                           
    "nik" text(16),                                                                                        
    "foto_public_id" TEXT, -- Tipe data sudah benar                                                        
    FOREIGN KEY (`deskel_id`) REFERENCES `deskel`(`id`) ON UPDATE no action ON DELETE no action,           
    FOREIGN KEY (`muhrim_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE set null,             
    FOREIGN KEY (`mursyid_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE set null,            
    FOREIGN KEY (`baiat_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE set null,              
    FOREIGN KEY (`wirid_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE set null               
);                                                                                                         
CREATE UNIQUE INDEX `murid_nik_unique` ON `murid` (`nik`);                                                 
CREATE INDEX `nama_idx` ON `murid` (`nama`);                                                               
CREATE INDEX `nama_arab_idx` ON `murid` (`nama_arab`);                                                     
CREATE TABLE nasyath (                                                                                     
    id INTEGER PRIMARY KEY AUTOINCREMENT,                                                                  
    murid_id INTEGER NOT NULL,                                                                             
    kegiatan TEXT NOT NULL,                                                                                
    tanggal_mulai TEXT,                                                                                    
    tanggal_selesai TEXT,                                                                                  
    durasi TEXT,                                                                                           
    tempat TEXT,                                                                                           
    jarak TEXT,                                                                                            
    keterangan TEXT,                                                                                       
    nama_kontak TEXT,                                                                                      
    telepon_kontak TEXT,                                                                                   
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,                                                    
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,                                                    
    updater_id TEXT NOT NULL,                                                                              
    FOREIGN KEY (murid_id) REFERENCES murid(id) ON DELETE CASCADE,                                         
    FOREIGN KEY (updater_id) REFERENCES users(id) ON DELETE NO ACTION                                      
);                                                                                                         
CREATE INDEX nasyath_murid_idx ON nasyath (murid_id);                                                      
CREATE INDEX nasyath_kegiatan_idx ON nasyath (kegiatan);                                                   
CREATE TABLE `permissions` (                                                                               
	`id` text PRIMARY KEY NOT NULL,                                                                            
	`name` text NOT NULL,                                                                                      
	`description` text                                                                                         
);                                                                                                         
CREATE TABLE "piket_schedule" (                                                                            
	"id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,                                                           
	"user_id" text NOT NULL,                                                                                   
	"role_id" text NOT NULL,                                                                                   
	"start_date" text NOT NULL,                                                                                
	"end_date" text NOT NULL,                                                                                  
	"group_id" text,                                                                                           
	"description" text,                                                                                        
	FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE cascade,                    
	FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON UPDATE no action ON DELETE cascade                     
);                                                                                                         
CREATE INDEX piket_user_idx ON piket_schedule(user_id);                                                    
CREATE INDEX piket_date_idx ON piket_schedule(start_date, end_date);                                       
CREATE TABLE `prop` (                                                                                      
    `id` integer PRIMARY KEY NOT NULL,                                                                     
    `propinsi` text NOT NULL                                                                               
  );                                                                                                       
CREATE UNIQUE INDEX `prop_propinsi_unique` ON `prop` (`propinsi`);                                         
CREATE TABLE `role_hierarchy` (                                                                            
	`parent_role_id` text NOT NULL,                                                                            
	`child_role_id` text NOT NULL,                                                                             
	PRIMARY KEY(`parent_role_id`, `child_role_id`),                                                            
	FOREIGN KEY (`parent_role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,             
	FOREIGN KEY (`child_role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade               
);                                                                                                         
CREATE INDEX role_hierarchy_idx ON role_hierarchy(parent_role_id, child_role_id);                          
CREATE TABLE `role_permissions` (                                                                          
	`role_id` text NOT NULL,                                                                                   
	`permission_id` text NOT NULL,                                                                             
	PRIMARY KEY(`role_id`, `permission_id`),                                                                   
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,                    
	FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON UPDATE no action ON DELETE cascade         
);                                                                                                         
CREATE INDEX role_permission_idx ON role_permissions(role_id, permission_id);                              
CREATE TABLE `roles` (                                                                                     
	`id` text PRIMARY KEY NOT NULL,                                                                            
	`name` text NOT NULL,                                                                                      
	`description` text                                                                                         
);                                                                                                         
CREATE TABLE "session" (                                                                                   
	`id` text PRIMARY KEY NOT NULL,                                                                            
	`user_id` text NOT NULL,                                                                                   
	`expires_at` integer NOT NULL,                                                                             
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade                     
);                                                                                                         
CREATE TABLE `user_roles` (                                                                                
	`user_id` text NOT NULL,                                                                                   
	`role_id` text NOT NULL,                                                                                   
	PRIMARY KEY(`user_id`, `role_id`),                                                                         
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,                    
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade                     
);                                                                                                         
CREATE INDEX user_idx ON user_roles(user_id);                                                              
CREATE INDEX role_idx ON user_roles(role_id);                                                              
CREATE TABLE "users" (                                                                                     
	`id` text PRIMARY KEY NOT NULL,                                                                            
	`username` text(16) NOT NULL,                                                                              
	`password_hash` text(255),                                                                                 
	`active` integer DEFAULT true,                                                                             
	`murid_id` integer,                                                                                        
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,                                                      
	FOREIGN KEY (`murid_id`) REFERENCES `murid`(`id`) ON UPDATE no action ON DELETE set null                   
);                                                                                                         
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);                                       
CREATE INDEX `created_at_idx` ON `users` (`created_at`);                                                   
