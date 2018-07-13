module.exports = {
	//MySql variables - local db
	// mysql_host: 'localhost',
	// mysql_user: 'root',
	// mysql_password: 'password',
	// mysql_database: 'mob_emp_app_dev_sql',
	// mysql_charset : 'utf8mb4'
	mysql_host: '127.0.0.1',
	mysql_user: 'root',
	mysql_password: 'root123',
	mysql_database: 'empapp',
	mysql_charset : 'utf8mb4',

	/*//MySQL variables - prod db
	mysql_host: "",
	mysql_user: "",
	mysql_password: "",
	mysql_database: "",*/

	//RedShift variables - dev
	/*rs_user: 'eng_ro',
	rs_password: '4b4847a45b334c52e78990e379fcc327eB',
	rs_database: 'events', 
	rs_port: 5439,
	rs_host: 'analytics-redshift-dev.meltwater.net'*/

	//RedShift variables - prod

	//application related variables
	use_template_name: "test-template-all-metrics-multiple-sheets.xlsx"
};