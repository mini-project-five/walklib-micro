package miniproject.domain;

import miniproject.infra.AbstractEvent;

//<<< DDD / Domain Event
public class BookRead extends AbstractEvent {

    private Long bookId;
    private Long userId;
    private String title;
    private Integer pointCost;
    private Boolean isFree;

    public BookRead() {
        super();
    }

    public BookRead(Book book, Long userId) {
        super(book);
        this.bookId = book.getBookId();
        this.userId = userId;
        this.title = book.getTitle();
        this.pointCost = book.getPointCost();
        this.isFree = book.getIsFree();
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getPointCost() {
        return pointCost;
    }

    public void setPointCost(Integer pointCost) {
        this.pointCost = pointCost;
    }

    public Boolean getIsFree() {
        return isFree;
    }

    public void setIsFree(Boolean isFree) {
        this.isFree = isFree;
    }
}
//>>> DDD / Domain Event