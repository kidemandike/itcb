from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from models import Course, Instructor, CourseRegistration, LevelEnum
from database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# === CRUD Courses ===
@router.post("/admin/add_course")
def add_course(
    title: str = Form(...),
    description: str = Form(""),
    duration: int = Form(...),
    price: float = Form(...),
    level: LevelEnum = Form(...),
    instructor_id: int = Form(...),
    db: Session = Depends(get_db)
):
    new_course = Course(
        title=title, description=description, duration=duration,
        price=price, level=level, instructor_id=instructor_id
    )
    db.add(new_course)
    db.commit()
    return {"message": "Course added"}

@router.get("/courses")
def list_courses(db: Session = Depends(get_db)):
    return db.query(Course).all()

# === Instructors ===
@router.post("/admin/add_instructor")
def add_instructor(name: str = Form(...), db: Session = Depends(get_db)):
    instructor = Instructor(name=name)
    db.add(instructor)
    db.commit()
    return {"message": "Instructor added"}

@router.get("/instructors")
def list_instructors(db: Session = Depends(get_db)):
    return db.query(Instructor).all()

# === Register User to Course ===
@router.post("/register_course")
def register_course(user_id: int = Form(...), course_id: int = Form(...), db: Session = Depends(get_db)):
    existing = db.query(CourseRegistration).filter_by(user_id=user_id, course_id=course_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already registered")
    registration = CourseRegistration(user_id=user_id, course_id=course_id)
    db.add(registration)
    db.commit()
    return {"message": "Registered to course"}
