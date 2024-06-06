<?php

require_once 'global.php';

class Post extends GlobalMethods
{

    private $pdo;
    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }



    public function doesEmailExist($email)
    {
        $sql = "SELECT email FROM user WHERE email = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$email]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result; // Return email or null
        } catch (PDOException $e) {
            // Handle database error
            return array();
        }
    }

    public function registerUser($data)
    {
        $sql = "INSERT INTO user(firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)";
        try {
            $hashed_password = password_hash($data->password, PASSWORD_DEFAULT);

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $data->firstName,
                $data->lastName,
                $data->email,
                $hashed_password,
                $data->role
            ]);

            switch ($data->role) {
                case 'student':
                    $sql = "UPDATE students SET studentId = ?, program = ?, year = ? WHERE email = ?";
                    try {
                        $stmt = $this->pdo->prepare($sql);
                        $stmt->execute([
                            $data->studentId,
                            $data->program,
                            $data->year,
                            $data->email
                        ]);
                        return $this->sendPayload(null, "success", "Successfully registered student", 200);
                    } catch (PDOException $e) {
                        $errmsg = $e->getMessage();
                        $code = 400;
                        return $this->sendPayload(null, "failed", $errmsg, $code);
                    }

                case 'advisor':
                    $sql = "UPDATE coordinators SET department = ? WHERE email = ?";
                    try {
                        $stmt = $this->pdo->prepare($sql);
                        $stmt->execute(
                            [
                                $data->department,
                                $data->email
                            ]
                        );
                        return $this->sendPayload(null, "success", "Successfully registered advisor", 200);
                    } catch (PDOException $e) {
                        $errmsg = $e->getMessage();
                        $code = 400;
                        return $this->sendPayload(null, "failed", $errmsg, $code);
                    }

                case 'supervisor':

                    $sql = "INSERT INTO industry_partners(company_name, address) VALUES (?, ?)";
                    try {

                        $stmt = $this->pdo->prepare($sql);
                        $stmt->execute(
                            [

                                $data->company_name,
                                $data->address,
                            ]
                        );
                    } catch (PDOException $e) {
                        $errmsg = $e->getMessage();
                        $code = 400;
                    }
                    $company_id = $this->pdo->lastInsertId();

                    $sql = "UPDATE supervisors SET company_id = ?, position = ?, phone = ? WHERE email = ?";
                    try {
                        $stmt = $this->pdo->prepare($sql);
                        $stmt->execute(
                            [
                                $company_id,
                                $data->position,
                                $data->phone,
                                $data->email
                            ]
                        );
                        return $this->sendPayload(null, "success", "Successfully registered supervisor", 200);
                    } catch (PDOException $e) {
                        $errmsg = $e->getMessage();
                        $code = 400;
                        return $this->sendPayload(null, "failed", $errmsg, $code);
                    }

                case 'admin':
                    return $this->sendPayload(null, "success", "Successfully registered admin", 200);


                default:
                    return $this->sendPayload(null, "failed", "Unknown role: " . $data->role, 400);
            }

        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "failed", $errmsg, $code);
        }
    }


    public function addOjtSite($student_id, $data)
    {
        $sql = "INSERT INTO ojt_sites(student_id, company_name, address, job_title, job_description, supervisor_name, supervisor_email, supervisor_phone)
        VALUES (?, ?, ? ,?, ?, ?, ?, ?)";
        try {

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $student_id,
                    $data->company_name,
                    $data->address,
                    $data->job_title,
                    $data->job_description,
                    $data->supervisor_name,
                    $data->supervisor_email,
                    $data->supervisor_phone,
                ]
            );
            return $this->sendPayload(null, "success", "Successfully created a new record", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function add_class($data)
    {
        $sql = "INSERT INTO class_blocks(block_name, department, course, year_level)
        VALUES (?, ?, ? ,?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->block_name,
                    $data->department,
                    $data->course,
                    $data->year_level,
                ]
            );
            return $this->sendPayload(null, "success", "Successfully created a new record", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }


    public function assignClassCoordinator($data)
    {
        $sql = "INSERT INTO rl_class_coordinators(coordinator_id, block_name)
        VALUES (?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->coordinator_id,
                    $data->block_name
                ]
            );
            return $this->sendPayload(null, "success", "Successfully created a new record", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }
    public function assignClassStudent($data, $id)
    {
        $sql = "UPDATE students SET block = ? WHERE id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->block_name,
                    $id
                ]
            );
            return $this->sendPayload(null, "success", "Successfully updated record", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }


    public function edit_user($data, $id)
    {
        $sql = "UPDATE user SET role = ?, isActive = ? WHERE id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->role,
                    $data->isActive,
                    $id
                ]
            );
            return $this->sendPayload(null, "success", "Successfully updated record", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }
    public function edit_coordinator($data, $id)
    {
        $sql = "UPDATE coordinators SET department = ? WHERE id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->department,
                    $id
                ]
            );
            return $this->sendPayload(null, "success", "Successfully updated record", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function edit_student_info($data, $id)
    {
        $sql = "UPDATE students SET firstName = ?, lastName = ?, studentId = ?, program = ?, year = ?, phoneNumber = ?, address = ?, dateOfBirth = ? WHERE id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->firstName,
                    $data->lastName,
                    $data->studentId,
                    $data->program,
                    $data->year,
                    $data->phoneNumber,
                    $data->address,
                    $data->dateOfBirth,
                    $id
                ]
            );
            return $this->sendPayload(null, "success", "Successfully updated record", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }


    public function toggleRequirementStatus($studentId, $requirement, $status)
    {
        $sql = "UPDATE student_requirements SET $requirement = ? WHERE student_id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$status, $studentId]);
            return $this->sendPayload(null, "success", "Successfully updated requirement status", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function toggleSubmissionRemark($table, $submissionId, $newRemark)
    {
        $sql = "UPDATE $table SET remarks = ? WHERE id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$newRemark, $submissionId]);
            return $this->sendPayload(null, "success", "Remark toggled successfully", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            return $this->sendPayload(null, "failed", $errmsg, 400);
        }
    }


    public function addSubmissionComment($table, $submissionId, $data)
    {
        $sql = "INSERT INTO $table (comments, file_id, commenter) VALUES (?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data->comments,
                    $submissionId,
                    $data->commenter
                ]
            );
            return $this->sendPayload(null, "success", "Successfully submitted comment", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }


    public function toggleStudentEvaluation($id, $newRemark)
    {

        $sql = "UPDATE students SET evaluation = ? WHERE id = ?";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$newRemark, $id]);
            return $this->sendPayload(null, "success", "Remark toggled successfully", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            return $this->sendPayload(null, "failed", $errmsg, 400);
        }
    }


    public function upload_requirement($data, $category)
    {
        $fileName = basename($_FILES["file"]["name"]);
        $fileType = pathinfo($fileName, PATHINFO_EXTENSION);
        $fileSize = $_FILES["file"]["size"];
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);


        $sql = "INSERT INTO submissions (user_id, submission_name, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data,
                    $category,
                    $fileName,
                    $fileType,
                    $fileSize,
                    $fileData
                ]
            );
            return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function upload_documentation($data, $category)
    {
        $fileName = basename($_FILES["file"]["name"]);
        $fileType = pathinfo($fileName, PATHINFO_EXTENSION);
        $fileSize = $_FILES["file"]["size"];
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);


        $sql = "INSERT INTO documentations (user_id, week, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data,
                    $category,
                    $fileName,
                    $fileType,
                    $fileSize,
                    $fileData
                ]
            );
            return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
            return $this->sendPayload(null, "Failed uploading file", $errmsg, $code);
        }     
    }



    public function dtrClockIn($user_id)
    {
        // Check if there's an active clock-in record with no clock-out
        $checkSql = "SELECT COUNT(*) FROM student_dailytimerecords WHERE student_id = ? AND date = CURDATE() AND endTime IS NULL";
        try {
            $checkStmt = $this->pdo->prepare($checkSql);
            $checkStmt->execute([$user_id]);
            $count = $checkStmt->fetchColumn();

            if ($count > 0) {
                // If there's an active clock-in record, prevent a new clock-in
                return $this->sendPayload(null, "failed", "You already have an active clock-in. Please clock out first.", 400);
            }

            // If no active clock-in record, proceed with clock-in
            $sql = "INSERT INTO student_dailytimerecords (student_id, date, startTime) VALUES (?, CURDATE(), CURTIME())";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$user_id]);

            return $this->sendPayload(null, "success", "Clock-in successful", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            return $this->sendPayload(null, "failed", $errmsg, 401);
        }
    }
    public function dtrClockOut($user_id)
    {
        $sql = "UPDATE student_dailytimerecords SET endTime = CURTIME() WHERE student_id = ? AND date = CURDATE() AND endTime IS NULL";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $user_id
                ]
            );

            if ($stmt->rowCount() > 0) {
                return $this->sendPayload(null, "success", "Clock-out successful", 200);
            } else {
                return $this->sendPayload(null, "failed", "No active clock-in found for today", 400);
            }
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            return $this->sendPayload(null, "failed", $errmsg, 401);
        }
    }


    public function upload_war($data, $category)
    {
        $fileName = basename($_FILES["file"]["name"]);
        $fileType = pathinfo($fileName, PATHINFO_EXTENSION);
        $fileSize = $_FILES["file"]["size"];
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);


        $sql = "INSERT INTO war (user_id, week, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data,
                    $category,
                    $fileName,
                    $fileType,
                    $fileSize,
                    $fileData
                ]
            );
            return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function upload_finalReport($data)
    {
        $fileName = basename($_FILES["file"]["name"]);
        $fileType = pathinfo($fileName, PATHINFO_EXTENSION);
        $fileSize = $_FILES["file"]["size"];
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);


        $sql = "INSERT INTO finalreports (user_id, file_name, file_type, file_size, file_data) VALUES (?, ?, ?, ?, ?)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $data,
                    $fileName,
                    $fileType,
                    $fileSize,
                    $fileData
                ]
            );
            return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }

    public function uploadAvatar($id)
    {
        $fileData = file_get_contents($_FILES["file"]["tmp_name"]);


        $sql = "UPDATE students SET avatar = ? WHERE id = $id";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(
                [
                    $fileData
                ]
            );
            return $this->sendPayload(null, "success", "Successfully uploaded file", 200);
        } catch (PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 400;
        }

        return $this->sendPayload(null, "failed", $errmsg, $code);
    }
}





